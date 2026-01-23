'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllTemplates, deleteTemplate, Template } from '@/lib/db';
import Button from '@/components/ui/Button';
import { toast, getErrorMessage } from '@/lib/notifications';

export default function HomePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const allTemplates = await getAllTemplates();
    setTemplates(allTemplates);
    setLoading(false);
  };

  const handleUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        console.log('No file selected');
        return;
      }

      console.log('File selected:', file.name, file.size, file.type);

      if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Maximum 10MB.');
        return;
      }

      // Show loading state
      const loadingMessage = document.createElement('div');
      loadingMessage.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
      loadingMessage.innerHTML = '<div class="bg-white dark:bg-gray-900 rounded-xl p-6"><p class="text-lg">Processing image...</p></div>';
      document.body.appendChild(loadingMessage);

      try {
        const reader = new FileReader();
        
        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          toast.error('Error reading file');
          document.body.removeChild(loadingMessage);
        };

        reader.onload = () => {
          const imageData = reader.result as string;
          console.log('Image loaded, size:', imageData.length);
          
          // Verify it's a valid image
          if (!imageData.startsWith('data:image/')) {
            console.error('Invalid image data');
            toast.error('Invalid image file');
            document.body.removeChild(loadingMessage);
            return;
          }

          // Store in sessionStorage
          try {
            sessionStorage.setItem('newTemplateImage', imageData);
            console.log('Image stored in sessionStorage');
            
            // Verify it was stored
            const stored = sessionStorage.getItem('newTemplateImage');
            if (stored) {
              console.log('Verified: Image in sessionStorage');
              // Navigate to editor
              document.body.removeChild(loadingMessage);
              router.push('/editor/new');
            } else {
              console.error('Failed to store image');
              toast.error('Failed to process image. Try a smaller file.');
              document.body.removeChild(loadingMessage);
            }
          } catch (storageError) {
            console.error('SessionStorage error:', storageError);
            toast.error('Image too large for browser storage. Try a smaller file.');
            document.body.removeChild(loadingMessage);
          }
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Error uploading image');
        document.body.removeChild(loadingMessage);
      }
    };

    input.click();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this template?')) {
      await deleteTemplate(id);
      loadTemplates();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4">
          Welcome to InkOra
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Personalize invitations beautifully, at scale.
        </p>
      </div>

      {/* Templates Section */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Your Templates</h2>
        
        {/* Horizontal Scrolling Gallery */}
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
          {/* Upload Card */}
          <div
            onClick={handleUpload}
            className="flex-none w-72 h-96 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all flex flex-col items-center justify-center gap-4 snap-start hover:shadow-glow"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-medium mb-1">Upload Template</p>
              <p className="text-sm text-gray-500">JPG or PNG, max 10MB</p>
            </div>
          </div>

          {/* Template Cards */}
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex-none w-72 h-96 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-glow transition-all duration-300 snap-start group hover:scale-105 hover:border-primary"
            >
              {/* Image Section */}
              <div
                className="h-64 bg-gray-100 dark:bg-gray-800 cursor-pointer relative overflow-hidden"
                onClick={() => router.push(`/editor/${template.id}`)}
              >
                {template.thumbnail ? (
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🎨</span>
                  </div>
                )}
                
                {/* Glow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-transparent transition-all duration-300" />
              </div>

              {/* Info Section */}
              <div className="p-4">
                <h3 className="font-medium mb-2 truncate">{template.name}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/editor/${template.id}`)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(template.id);
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {templates.length === 0 && (
            <div className="flex-none w-72 h-96 flex items-center justify-center text-center text-gray-400 px-8">
              <div>
                <p className="mb-2">No templates yet</p>
                <p className="text-sm">Upload one to get started!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎨</span>
          </div>
          <h3 className="font-medium mb-2">Easy Design</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload your design and add custom text fields with our intuitive editor
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="font-medium mb-2">Bulk Generation</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate hundreds of personalized invitations from CSV or Excel files
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📥</span>
          </div>
          <h3 className="font-medium mb-2">Quick Download</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Download all invitations as a ZIP file ready to print or share
          </p>
        </div>
      </div>
    </div>
  );
}