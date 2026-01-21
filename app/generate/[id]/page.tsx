'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTemplate, Template } from '@/lib/db';
import Button from '@/components/ui/Button';
import SingleGenerationForm from '@/components/generation/SingleGenerationForm';
import BulkGenerationForm from '@/components/generation/BulkGenerationForm';

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  useEffect(() => {
    loadTemplate();
  }, [id]);

  const loadTemplate = async () => {
    console.log('Loading template for generation:', id);
    const temp = await getTemplate(id);
    
    if (temp) {
      console.log('Template loaded:', temp);
      setTemplate(temp);
    } else {
      console.error('Template not found');
      alert('Template not found');
      router.push('/');
    }
    setLoading(false);
  };

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
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Template Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The template could not be loaded.
          </p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (template.textBoxes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">No Text Fields</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This template has no text boxes. Add at least one text box to generate invitations.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => router.push('/')}>
              Go Home
            </Button>
            <Button onClick={() => router.push(`/editor/${id}`)}>
              Edit Template
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Generate Invitations</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Template: {template.name}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/editor/${id}`)}
              >
                ← Back to Editor
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/')}
              >
                Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Choose Generation Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Single Generation */}
            <button
              onClick={() => setMode('single')}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                mode === 'single'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📄</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Single Generation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create one invitation by filling in the fields manually
                  </p>
                </div>
              </div>
            </button>

            {/* Bulk Generation */}
            <button
              onClick={() => setMode('bulk')}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                mode === 'bulk'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Bulk Generation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload CSV/Excel to generate multiple invitations at once
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Generation Form */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          {mode === 'single' ? (
            <SingleGenerationForm template={template} />
          ) : (
            <BulkGenerationForm template={template} />
          )}
        </div>
      </div>
    </div>
  );
}