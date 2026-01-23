'use client';

import { useState, useEffect } from 'react';
import { Template } from '@/lib/db';
import Button from '@/components/ui/Button';
import { getFieldSuggestions } from '@/lib/aiSuggestions';

interface SingleGenerationFormProps {
  template: Template;
}

export default function SingleGenerationForm({ template }: SingleGenerationFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [livePreview, setLivePreview] = useState(true);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [showSuggestions, setShowSuggestions] = useState<string | null>(null);
  // Live preview with debounce
  useEffect(() => {
    if (livePreview && Object.keys(formData).length > 0) {
      const debounceTimer = setTimeout(() => {
        handleGenerate();
      }, 800);
      return () => clearTimeout(debounceTimer);
    }
  }, [formData, livePreview]);

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = template.width;
      canvas.height = template.height;
      const ctx = canvas.getContext('2d')!;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);

        // Draw color boxes
        template.colorBoxes.forEach((box) => {
          ctx.fillStyle = box.fillColor;
          ctx.globalAlpha = box.opacity;
          ctx.fillRect(box.x, box.y, box.width, box.height);
          ctx.globalAlpha = 1;
        });

        // Draw text boxes
        template.textBoxes.forEach((box) => {
          const text = formData[box.id] || '';
          
          ctx.font = `${box.fontWeight} ${box.fontSize}px ${box.fontFamily}`;
          ctx.fillStyle = box.color;
          
          let textX = box.x;
          if (box.textAlign === 'center') {
            ctx.textAlign = 'center';
            textX = box.x + box.width / 2;
          } else if (box.textAlign === 'right') {
            ctx.textAlign = 'right';
            textX = box.x + box.width;
          } else {
            ctx.textAlign = 'left';
          }
          
          ctx.fillText(text, textX, box.y + box.fontSize);
        });

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPreviewImage(dataUrl);
        setGenerating(false);
      };

      img.src = template.imageData;
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate invitation');
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!previewImage) return;

    // Get name from first text box or use timestamp
    let fileName = 'invitation';
    if (template.textBoxes.length > 0) {
      const firstField = template.textBoxes[0];
      const name = formData[firstField.id];
      if (name) {
        // Sanitize filename
        fileName = name.replace(/[^a-zA-Z0-9]/g, '_');
      }
    }

    const link = document.createElement('a');
    link.download = `${fileName}_${Date.now()}.jpg`;
    link.href = previewImage;
    link.click();
  };

  const handleShare = async () => {
    if (!previewImage) return;

    try {
      const blob = await (await fetch(previewImage)).blob();
      const file = new File([blob], 'invitation.jpg', { type: 'image/jpeg' });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Invitation',
        });
      } else {
        alert('Sharing not supported. Use download instead.');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

    // Check if template has only color boxes (no text boxes)
  const hasOnlyColorBoxes = template.textBoxes.length === 0 && template.colorBoxes.length > 0;

  // Auto-generate preview for color-only templates
  useEffect(() => {
    if (hasOnlyColorBoxes && !previewImage) {
      handleGenerate();
    }
  }, [hasOnlyColorBoxes]);

  return (
    <div className="space-y-6">
      {/* Show form only if there are text boxes */}
      {!hasOnlyColorBoxes && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Enter Details</h2>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={livePreview}
                onChange={(e) => setLivePreview(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-gray-600 dark:text-gray-400">Live Preview</span>
            </label>
          </div>
          
          <div className="space-y-4">
            {template.textBoxes.map((box) => (
              <div key={box.id} className="relative">
                  <label className="block text-sm font-medium mb-2">
                      {box.fieldName}
                  </label>
                  <div className="flex gap-2">
                      <input
                          type="text"
                          value={formData[box.id] || ''}
                          onChange={(e) => setFormData({ ...formData, [box.id]: e.target.value })}
                          onFocus={async () => {
                          if (!suggestions[box.id]) {
                              const sug = await getFieldSuggestions(box.fieldName);
                              setSuggestions({ ...suggestions, [box.id]: sug });
                          }
                          setShowSuggestions(box.id);
                          }}
                          className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary"
                          placeholder={`Enter ${box.fieldName}`}
                      />
                      <button
                      onClick={async () => {
                      if (!suggestions[box.id]) {
                          const sug = await getFieldSuggestions(box.fieldName);
                          setSuggestions({ ...suggestions, [box.id]: sug });
                      }
                      setShowSuggestions(showSuggestions === box.id ? null : box.id);
                      }}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="AI Suggestions"
                  >
                      💡
                  </button>
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions === box.id && suggestions[box.id] && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          💡 AI Suggestions - Click to use
                      </p>
                      </div>
                      {suggestions[box.id].map((suggestion, idx) => (
                      <button
                          key={idx}
                          onClick={() => {
                          setFormData({ ...formData, [box.id]: suggestion });
                          setShowSuggestions(null);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                      >
                          {suggestion}
                      </button>
                      ))}
                  </div>
                  )}
              </div>
              ))}
          </div>

          {!livePreview && (
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full mt-6"
            >
              {generating ? 'Generating...' : 'Generate Preview'}
            </Button>
          )}

          {livePreview && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Preview updates automatically as you type
            </p>
          )}
        </div>
      )}

      {/* Info message for color-only templates */}
      {hasOnlyColorBoxes && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🎨</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Color Overlay Template
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                This template uses color overlays only. Your invitation is ready to download!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview - Show for both text box and color-only templates */}
      {previewImage && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-medium mb-4">Preview</h2>
          
          <div className="mb-4">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleDownload} className="flex-1">
              📥 Download
            </Button>
            <Button onClick={handleShare} variant="secondary" className="flex-1">
              📤 Share
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">
            File will be named: {template.textBoxes.length > 0 && formData[template.textBoxes[0].id] 
              ? `${formData[template.textBoxes[0].id].replace(/[^a-zA-Z0-9]/g, '_')}.jpg`
              : `invitation_${Date.now()}.jpg`}
          </p>
        </div>
      )}

      {/* Loading state */}
      {generating && !previewImage && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Generating preview...</p>
        </div>
      )}
    </div>
  );
}