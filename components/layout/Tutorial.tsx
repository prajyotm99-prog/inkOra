'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

const tutorialSteps = [
  {
    title: '🎨 Welcome to InkOra!',
    description: 'Create personalized invitations at scale. Let\'s get started with a quick tour!',
    highlight: null,
  },
  {
    title: '📤 Step 1: Upload Template',
    description: 'Click the upload button to add your invitation design. We support JPG and PNG files up to 10MB.',
    highlight: 'upload-button',
  },
  {
    title: '📝 Step 2: Add Text Boxes',
    description: 'Click "Text Box" then drag on your template to create fields for names, dates, or any custom text.',
    highlight: 'text-box-button',
  },
  {
    title: '🎨 Step 3: Add Color Boxes',
    description: 'Use "Color Box" to add colored rectangles or gradients that blend with your design.',
    highlight: 'color-box-button',
  },
  {
    title: '⚙️ Step 4: Customize Properties',
    description: 'Select any box to change fonts, colors, sizes, and more in the properties panel.',
    highlight: 'properties-panel',
  },
  {
    title: '💾 Step 5: Save Template',
    description: 'Click "Save Template" to store your design. You can edit it anytime!',
    highlight: 'save-button',
  },
  {
    title: '🚀 Step 6: Generate!',
    description: 'Use "Generate" for single invitations or upload CSV/Excel for bulk generation!',
    highlight: 'generate-button',
  },
  {
    title: '✨ You\'re Ready!',
    description: 'Start creating beautiful personalized invitations. Need help? Check our FAQ or contact support.',
    highlight: null,
  },
];

export default function Tutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeenTutorial = localStorage.getItem('inkora_tutorial_completed');
    if (!hasSeenTutorial) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const handleClose = () => {
    localStorage.setItem('inkora_tutorial_completed', 'true');
    setIsVisible(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem('inkora_tutorial_completed');
    setCurrentStep(0);
    setIsVisible(true);
  };

  // Expose reset function globally
  useEffect(() => {
    (window as any).resetInkoraTutorial = resetTutorial;
  }, []);

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm" onClick={handleSkip} />

      {/* Tutorial Card */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md px-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 animate-scale-in">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-500">
                Step {currentStep + 1} of {tutorialSteps.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Skip Tutorial
              </button>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Illustration/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary-dark/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">
                {currentStep === 0 ? '👋' :
                 currentStep === 1 ? '📤' :
                 currentStep === 2 ? '📝' :
                 currentStep === 3 ? '🎨' :
                 currentStep === 4 ? '⚙️' :
                 currentStep === 5 ? '💾' :
                 currentStep === 6 ? '🚀' : '✨'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="secondary"
                onClick={handlePrevious}
                className="flex-1"
              >
                Previous
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleNext}
              className="flex-1"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-primary w-4'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}