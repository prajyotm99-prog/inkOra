'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerPanelProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  showEyeDropper?: boolean;
}

export default function ColorPickerPanel({ 
  color, 
  onChange, 
  label = 'Color',
  showEyeDropper = false 
}: ColorPickerPanelProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleEyeDropper = async () => {
    try {
      // @ts-ignore - EyeDropper API
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      onChange(result.sRGBHex);
    } catch (error) {
      alert('Eye dropper not supported. Please use Chrome or Edge browser.');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      
      <div className="space-y-2">
        {/* Color Preview Button */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-full h-12 rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-primary transition-colors relative overflow-hidden"
          style={{ backgroundColor: color }}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors">
            <span className="text-xs font-medium text-white drop-shadow-lg">
              Click to change
            </span>
          </div>
        </button>

        {/* Eye Dropper Button */}
        {showEyeDropper && (
          <button
            onClick={handleEyeDropper}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>🎨</span>
            <span>Pick from Image</span>
          </button>
        )}

        {/* Color Picker Popup */}
        {showPicker && (
          <div className="relative">
            <div className="absolute top-0 left-0 z-50 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
              <HexColorPicker color={color} onChange={onChange} />
              
              {/* Hex Input */}
              <div className="mt-3">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono"
                  placeholder="#FFFFFF"
                />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowPicker(false)}
                className="mt-3 w-full px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}