'use client';

import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerPanelProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  showEyeDropper?: boolean;
  // NEW: Canvas eyedropper
  onActivateCanvasEyedropper?: () => void;
  isEyedropperActive?: boolean;
}

export default function ColorPickerPanel({ 
  color, 
  onChange, 
  label = 'Color',
  showEyeDropper = false,
  onActivateCanvasEyedropper,
  isEyedropperActive = false,
}: ColorPickerPanelProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempColor, setTempColor] = useState(color);
  const [hexInput, setHexInput] = useState(color);
  const [eyeDropperSupported, setEyeDropperSupported] = useState(false);

  useEffect(() => {
    // @ts-ignore
    setEyeDropperSupported(typeof window !== 'undefined' && 'EyeDropper' in window);
  }, []);

  useEffect(() => {
    setTempColor(color);
    setHexInput(color);
  }, [color]);

  const handleColorChange = (newColor: string) => {
    setTempColor(newColor);
    setHexInput(newColor.toUpperCase());
  };

  const handleHexInputChange = (value: string) => {
    let hexValue = value.startsWith('#') ? value : '#' + value;
    setHexInput(hexValue.toUpperCase());
    
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexPattern.test(hexValue)) {
      setTempColor(hexValue.toUpperCase());
    }
  };

  const handleDone = () => {
    onChange(tempColor);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempColor(color);
    setHexInput(color);
    setShowPicker(false);
  };

  const handleOpenPicker = () => {
    setTempColor(color);
    setHexInput(color);
    setShowPicker(true);
  };

  const handleEyeDropper = async () => {
    try {
      // @ts-ignore
      if (!window.EyeDropper) {
        alert('Eye dropper is only available on Chrome/Edge desktop browsers.');
        return;
      }

      // @ts-ignore
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      
      const pickedColor = result.sRGBHex.toUpperCase();
      onChange(pickedColor);
      setTempColor(pickedColor);
      setHexInput(pickedColor);
      setShowPicker(false);
      
    } catch (error) {
      console.log('Eye dropper cancelled');
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2">{label}</label>
      
      <div className="space-y-2">
        <button
          onClick={handleOpenPicker}
          className="w-full h-16 rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-primary transition-colors relative overflow-hidden group"
          style={{ backgroundColor: color }}
          type="button"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors gap-1">
            <span className="text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {color.toUpperCase()}
            </span>
            <span className="text-xs text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Tap to change
            </span>
          </div>
        </button>

        {/* NEW: Canvas Eyedropper - Works on ALL devices */}
        {showEyeDropper && onActivateCanvasEyedropper && (
          <button
            onClick={onActivateCanvasEyedropper}
            type="button"
            className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 border-2 ${
              isEyedropperActive
                ? 'bg-primary text-white border-primary shadow-lg'
                : 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800 hover:from-indigo-100 hover:to-purple-100'
            }`}
          >
            <span className="text-lg">🎨</span>
            <span>{isEyedropperActive ? 'Picking... (tap image)' : 'Pick from Image'}</span>
          </button>
        )}

        {/* Original Browser Eyedropper - Desktop only */}
        {showEyeDropper && eyeDropperSupported && (
          <button
            onClick={handleEyeDropper}
            type="button"
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 hover:from-purple-200 hover:to-blue-200 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 border border-purple-200 dark:border-purple-800"
          >
            <span className="text-lg">💧</span>
            <span>Pick from Screen (Desktop)</span>
          </button>
        )}

        {showPicker && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={handleCancel}
            />
            
            <div className="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:bottom-auto md:right-auto md:transform md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-t-3xl md:rounded-xl shadow-2xl border-t-2 md:border-2 border-gray-200 dark:border-gray-700 max-w-full md:w-[320px] max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Choose Color</h3>
                <button
                  onClick={handleCancel}
                  type="button"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors w-8 h-8 flex items-center justify-center text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 flex justify-center">
                <HexColorPicker 
                  color={tempColor} 
                  onChange={handleColorChange}
                  style={{ 
                    width: '100%',
                    maxWidth: '280px',
                    height: '200px'
                  }}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Hex Color Code
                </label>
                <div className="flex gap-3">
                  <div 
                    className="w-14 h-14 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 shadow-inner"
                    style={{ backgroundColor: tempColor }}
                  />
                  
                  <input
                    type="text"
                    value={hexInput}
                    onChange={(e) => handleHexInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleDone();
                      if (e.key === 'Escape') handleCancel();
                    }}
                    className="flex-1 px-3 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-base font-mono border-2 border-gray-300 dark:border-gray-600 focus:border-primary focus:outline-none"
                    placeholder="#FFFFFF"
                    maxLength={7}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Type hex code (e.g., #FF5733 or FF5733)
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Quick Colors
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {[
                    '#000000', '#FFFFFF', '#FF0000', '#00FF00',
                    '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
                    '#FF5733', '#33FF57', '#3357FF', '#F39C12',
                    '#9B59B6', '#E74C3C', '#3498DB', '#2ECC71'
                  ].map(presetColor => (
                    <button
                      key={presetColor}
                      onClick={() => {
                        setTempColor(presetColor);
                        setHexInput(presetColor);
                      }}
                      type="button"
                      className="w-full aspect-square rounded-lg border-2 hover:scale-110 transition-transform"
                      style={{ 
                        backgroundColor: presetColor,
                        borderColor: tempColor === presetColor ? '#6366f1' : '#d1d5db'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  type="button"
                  className="flex-1 px-4 py-3 md:py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-base md:text-sm font-medium transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDone}
                  type="button"
                  className="flex-1 px-4 py-3 md:py-2 bg-primary text-white rounded-lg text-base md:text-sm font-medium hover:bg-primary-dark transition-colors min-h-[44px]"
                >
                  ✓ Apply Color
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}