'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getTemplate, saveTemplate, Template, TextBox, ColorBox } from '@/lib/db';
import { compressImage, createThumbnail } from '@/lib/imageProcessor';
import Button from '@/components/ui/Button';
import TemplateCanvas from '@/components/editor/TemplateCanvas';
import PropertiesPanel from '@/components/editor/PropertiesPanel';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'select' | 'text' | 'color'>('select');
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [isLoadingRef, setIsLoadingRef] = useState(false);

  useEffect(() => {
    if (!isLoadingRef) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    if (isLoadingRef) {
      console.log('Already loading, skipping...');
      return;
    }
    setIsLoadingRef(true);
    
    console.log('Loading template, id:', id);
 
    if (id === 'new') {
      console.log('New template - checking sessionStorage');
      
      const imageData = sessionStorage.getItem('newTemplateImage');
      
      if (!imageData) {
        console.error('No image data in sessionStorage');
        alert('No image found. Please upload again.');
        router.push('/');
        setLoading(false);
        setIsLoadingRef(false);
        return;
      }

      console.log('Image data found, length:', imageData.length);
      
      try {
        const compressed = await compressImage(imageData);
        console.log('Image compressed');
        
        const thumbnail = await createThumbnail(imageData);
        console.log('Thumbnail created');

        const img = new Image();
        
        img.onerror = (error) => {
          console.error('Image load error:', error);
          alert('Failed to load image');
          router.push('/');
          setLoading(false);
          setIsLoadingRef(false);
        };

        img.onload = () => {
          console.log('Image loaded:', img.width, 'x', img.height);
          
          sessionStorage.removeItem('newTemplateImage');
          console.log('SessionStorage cleared');
        
          const now = Date.now();
          const newTemplate: Template = {
            id: `template_${now}`,
            name: `Template ${new Date().toLocaleString()}`,
            imageData: compressed,
            thumbnail: thumbnail,
            width: img.width,
            height: img.height,
            textBoxes: [],
            colorBoxes: [],
            createdAt: now,
            updatedAt: now,
          };
          
          console.log('Template created:', newTemplate);
          setTemplate(newTemplate);
          setLoading(false);
          setIsLoadingRef(false);
        };
        
        img.src = compressed;
      } catch (error) {
        console.error('Template creation error:', error);
        alert('Error processing image: ' + error);
        router.push('/');
        setLoading(false);
        setIsLoadingRef(false);
      }
    } else {
      console.log('Loading existing template:', id);
      const existing = await getTemplate(id);
      if (existing) {
        console.log('Template loaded:', existing);
        setTemplate(existing);
      } else {
        console.log('Template not found');
        alert('Template not found');
        router.push('/');
      }
      setLoading(false);
      setIsLoadingRef(false);
    }
  };

  const handleSave = async () => {
    if (!template) return;
    
    setSaving(true);
    try {
      await saveTemplate({
        ...template,
        updatedAt: Date.now(),
      });
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save template');
    }
    setSaving(false);
  };
const handleGenerate = async () => {
  console.log('🚀 GENERATE CLICKED');
  
  if (!template) {
    alert('No template');
    return;
  }

  if (template.textBoxes.length === 0) {
    alert('Please add at least one text box first.');
    return;
  }

  // Save template FIRST
  setSaving(true);
  try {
    console.log('💾 Saving template:', template.id);
    await saveTemplate({
      ...template,
      updatedAt: Date.now(),
    });
    
    // Wait a bit for database
    await new Promise(r => setTimeout(r, 200));
    
    // Verify it saved
    const check = await getTemplate(template.id);
    console.log('✅ Verified saved:', check);
    
    if (!check) {
      throw new Error('Template not saved!');
    }
    
    // Navigate
    const url = `/generate/${template.id}`;
    console.log('🔄 Navigating to:', url);
    router.push(url);
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Failed to save: ' + error);
  }
  setSaving(false);
};

  const handleAddTextBox = (box: Omit<TextBox, 'id'>) => {
    if (!template) return;
    
    const newBox: TextBox = {
      ...box,
      id: `text_${Date.now()}`,
    };

    setTemplate({
      ...template,
      textBoxes: [...template.textBoxes, newBox],
      updatedAt: Date.now(),
    });
    setSelectedBox(newBox.id);
    setMode('select');
  };

  const handleAddColorBox = (box: Omit<ColorBox, 'id'>) => {
    if (!template) return;
    
    const newBox: ColorBox = {
      ...box,
      id: `color_${Date.now()}`,
    };

    setTemplate({
      ...template,
      colorBoxes: [...template.colorBoxes, newBox],
      updatedAt: Date.now(),
    });
    setSelectedBox(newBox.id);
    setMode('select');
  };

  const handleUpdateTextBox = (id: string, updates: Partial<TextBox>) => {
    if (!template) return;
    
    setTemplate({
      ...template,
      textBoxes: template.textBoxes.map((box) =>
        box.id === id ? { ...box, ...updates } : box
      ),
      updatedAt: Date.now(),
    });
  };

  const handleUpdateColorBox = (id: string, updates: Partial<ColorBox>) => {
    if (!template) return;
    
    setTemplate({
      ...template,
      colorBoxes: template.colorBoxes.map((box) =>
        box.id === id ? { ...box, ...updates } : box
      ),
      updatedAt: Date.now(),
    });
  };

  const handleDeleteBox = () => {
    if (!template || !selectedBox) return;
    
    setTemplate({
      ...template,
      textBoxes: template.textBoxes.filter((box) => box.id !== selectedBox),
      colorBoxes: template.colorBoxes.filter((box) => box.id !== selectedBox),
      updatedAt: Date.now(),
    });
    setSelectedBox(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedBox) {
        handleDeleteBox();
      } else if (e.key === 'Escape') {
        setSelectedBox(null);
        setMode('select');
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBox, template]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">Template not found</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const selectedTextBox = template.textBoxes.find((b) => b.id === selectedBox);
  const selectedColorBox = template.colorBoxes.find((b) => b.id === selectedBox);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Canvas Area - LEFT */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value, updatedAt: Date.now() })}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg border-0 focus:ring-2 focus:ring-primary text-sm"
                placeholder="Template name"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={mode === 'select' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setMode('select')}
              >
                Select
              </Button>
              <Button
                variant={mode === 'text' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setMode('text')}
              >
                Text Box
              </Button>
              <Button
                variant={mode === 'color' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setMode('color')}
              >
                Color Box
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                Cancel
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleGenerate}
                disabled={template.textBoxes.length === 0 || saving}
              >
                {saving ? 'Saving...' : 'Generate'}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </div>

          {/* Mode Indicator */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {mode === 'select' && '👆 Click on a box to select and edit it'}
            {mode === 'text' && '✏️ Drag on canvas to create a text box'}
            {mode === 'color' && '🎨 Drag on canvas to create a color box'}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
          <TemplateCanvas
            template={template}
            mode={mode}
            selectedBox={selectedBox}
            onSelectBox={setSelectedBox}
            onAddTextBox={handleAddTextBox}
            onAddColorBox={handleAddColorBox}
            onUpdateTextBox={handleUpdateTextBox}
            onUpdateColorBox={handleUpdateColorBox}
          />
        </div>
      </div>

      {/* Properties Panel - RIGHT */}
      <div className="w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Properties</h2>
            {selectedBox && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBox(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </Button>
            )}
          </div>
          
          <PropertiesPanel
            selectedBox={selectedBox}
            textBox={selectedTextBox}
            colorBox={selectedColorBox}
            onUpdateTextBox={handleUpdateTextBox}
            onUpdateColorBox={handleUpdateColorBox}
            onDelete={handleDeleteBox}
          />
        </div>
      </div>
    </div>
  );
}