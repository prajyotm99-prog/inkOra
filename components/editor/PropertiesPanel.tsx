'use client';

import { useState } from 'react';
import { TextBox, ColorBox } from '@/lib/db';
import { HexColorPicker } from 'react-colorful';
import Button from '@/components/ui/Button';
import ColorPickerPanel from '@/components/ui/ColorPickerPanel';

interface PropertiesPanelProps {
  selectedBox: string | null;
  textBox?: TextBox;
  colorBox?: ColorBox;
  onUpdateTextBox: (id: string, updates: Partial<TextBox>) => void;
  onUpdateColorBox: (id: string, updates: Partial<ColorBox>) => void;
  onDelete: () => void;
}

export default function PropertiesPanel({
  selectedBox,
  textBox,
  colorBox,
  onUpdateTextBox,
  onUpdateColorBox,
  onDelete,
}: PropertiesPanelProps) {
  if (!selectedBox) {
    return (
      <div className="flex items-center justify-center h-64 text-center p-6">
        <div>
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👆</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2 font-medium">No box selected</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Click on a box to edit properties
          </p>
        </div>
      </div>
    );
  }

  // TEXT BOX PROPERTIES
  if (textBox) {
    const [showTextColorPicker, setShowTextColorPicker] = useState(false);
    const [showBgColorPicker, setShowBgColorPicker] = useState(false);
    const [hasBackground, setHasBackground] = useState(!!textBox.backgroundColor);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Text Box Properties</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDelete} 
            className="text-red-500 w-full hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            🗑️ Delete Box
          </Button>
        </div>

        {/* Preview */}
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Preview:</p>
          <div
            style={{
              fontFamily: textBox.fontFamily,
              fontSize: `${Math.min(textBox.fontSize, 24)}px`,
              fontWeight: textBox.fontWeight,
              color: textBox.color,
              textAlign: textBox.textAlign as any,
              backgroundColor: hasBackground ? textBox.backgroundColor : 'transparent',
              opacity: hasBackground ? textBox.backgroundOpacity : 1,
              padding: '12px',
              borderRadius: '6px',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: textBox.textAlign === 'left' ? 'flex-start' : textBox.textAlign === 'right' ? 'flex-end' : 'center',
            }}
          >
            {textBox.fieldName || 'Sample Text'}
          </div>
        </div>

        {/* Field Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">Field Name</label>
          <input
            type="text"
            value={textBox.fieldName}
            onChange={(e) => onUpdateTextBox(textBox.id, { fieldName: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary text-sm"
            placeholder="e.g., Name, Phone, Address"
          />
        </div>

        {/* Font Family */}
        <div>
          <label className="block text-sm font-semibold mb-2">Font Family</label>
          <select
            value={textBox.fontFamily}
            onChange={(e) => onUpdateTextBox(textBox.id, { fontFamily: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="sans-serif">Sans Serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Font Size: {textBox.fontSize}px
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min="8"
              max="120"
              value={textBox.fontSize}
              onChange={(e) => onUpdateTextBox(textBox.id, { fontSize: parseInt(e.target.value) })}
              className="flex-1"
            />
            <input
              type="number"
              min="8"
              max="120"
              value={textBox.fontSize}
              onChange={(e) => onUpdateTextBox(textBox.id, { fontSize: parseInt(e.target.value) || 16 })}
              className="w-20 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm text-center border-0 focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Font Weight */}
        <div>
          <label className="block text-sm font-semibold mb-2">Font Weight</label>
          <select
            value={textBox.fontWeight}
            onChange={(e) => onUpdateTextBox(textBox.id, { fontWeight: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="300">Light (300)</option>
            <option value="normal">Normal (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi-Bold (600)</option>
            <option value="bold">Bold (700)</option>
            <option value="800">Extra Bold (800)</option>
          </select>
        </div>

        {/* Text Align */}
        <div>
          <label className="block text-sm font-semibold mb-2">Text Alignment</label>
          <div className="grid grid-cols-3 gap-2">
            {(['left', 'center', 'right'] as const).map((align) => (
              <Button
                key={align}
                variant={textBox.textAlign === align ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onUpdateTextBox(textBox.id, { textAlign: align })}
                className="w-full"
              >
                {align === 'left' ? '◀' : align === 'center' ? '▣' : '▶'}
              </Button>
            ))}
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-semibold mb-2">Text Color</label>
          <div className="relative">
            <button
              onClick={() => setShowTextColorPicker(!showTextColorPicker)}
              className="w-full h-12 rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-primary transition-colors flex items-center justify-center"
              style={{ backgroundColor: textBox.color }}
            >
              <span className="text-xs font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {textBox.color}
              </span>
            </button>
            {showTextColorPicker && (
              <div className="absolute top-14 left-0 z-50 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700">
                <HexColorPicker
                  color={textBox.color}
                  onChange={(color) => onUpdateTextBox(textBox.id, { color })}
                />
                <input
                  type="text"
                  value={textBox.color}
                  onChange={(e) => onUpdateTextBox(textBox.id, { color: e.target.value })}
                  className="mt-3 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono text-center"
                />
                <button
                  onClick={() => setShowTextColorPicker(false)}
                  className="mt-3 w-full px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Background Toggle */}
        <div>
          <label className="block text-sm font-semibold mb-2">Background</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={!hasBackground ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setHasBackground(false);
                onUpdateTextBox(textBox.id, { backgroundColor: undefined, backgroundOpacity: undefined });
              }}
            >
              Transparent
            </Button>
            <Button
              variant={hasBackground ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setHasBackground(true);
                onUpdateTextBox(textBox.id, { 
                  backgroundColor: textBox.backgroundColor || '#FFFFFF',
                  backgroundOpacity: textBox.backgroundOpacity || 0.8
                });
              }}
            >
              Colored
            </Button>
          </div>
        </div>

        {/* Background Color & Opacity */}
        {hasBackground && (
          <>
            <div>
              <label className="block text-sm font-semibold mb-2">Background Color</label>
              <div className="relative">
                <button
                  onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                  className="w-full h-12 rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-primary transition-colors flex items-center justify-center"
                  style={{ backgroundColor: textBox.backgroundColor || '#FFFFFF' }}
                >
                  <span className="text-xs font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                    {textBox.backgroundColor || '#FFFFFF'}
                  </span>
                </button>
                {showBgColorPicker && (
                  <div className="absolute top-14 left-0 z-50 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700">
                    <HexColorPicker
                      color={textBox.backgroundColor || '#FFFFFF'}
                      onChange={(color) => onUpdateTextBox(textBox.id, { backgroundColor: color })}
                    />
                    <input
                      type="text"
                      value={textBox.backgroundColor || '#FFFFFF'}
                      onChange={(e) => onUpdateTextBox(textBox.id, { backgroundColor: e.target.value })}
                      className="mt-3 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono text-center"
                    />
                    <button
                      onClick={() => setShowBgColorPicker(false)}
                      className="mt-3 w-full px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Background Opacity: {Math.round((textBox.backgroundOpacity || 1) * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={textBox.backgroundOpacity || 1}
                onChange={(e) => onUpdateTextBox(textBox.id, { backgroundOpacity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>
    );
  }

  // COLOR BOX PROPERTIES
  if (colorBox) {
    const [fillType, setFillType] = useState<'solid' | 'gradient'>(colorBox.fillType || 'solid');

    const updateFillType = (type: 'solid' | 'gradient') => {
      setFillType(type);
      onUpdateColorBox(colorBox.id, {
        fillType: type,
        fillColor2: type === 'gradient' ? (colorBox.fillColor2 || '#FFFFFF') : undefined,
      });
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Color Box Properties</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDelete} 
            className="text-red-500 w-full hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            🗑️ Delete Box
          </Button>
        </div>

        {/* Fill Type */}
        <div>
          <label className="block text-sm font-semibold mb-2">Fill Type</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={fillType === 'solid' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => updateFillType('solid')}
            >
              Solid
            </Button>
            <Button
              variant={fillType === 'gradient' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => updateFillType('gradient')}
            >
              Gradient
            </Button>
          </div>
        </div>

        {/* Color Pickers */}
        {fillType === 'solid' ? (
          <ColorPickerPanel
            color={colorBox.fillColor}
            onChange={(color) => onUpdateColorBox(colorBox.id, { fillColor: color })}
            label="Fill Color"
            showEyeDropper={true}
          />
        ) : (
          <>
            <ColorPickerPanel
              color={colorBox.fillColor}
              onChange={(color) => onUpdateColorBox(colorBox.id, { fillColor: color })}
              label="Gradient Start"
              showEyeDropper={true}
            />
            
            <ColorPickerPanel
              color={colorBox.fillColor2 || '#FFFFFF'}
              onChange={(color) => onUpdateColorBox(colorBox.id, { fillColor2: color })}
              label="Gradient End"
              showEyeDropper={true}
            />

            {/* Gradient Preview */}
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Gradient Preview:</p>
              <div 
                className="h-16 rounded-lg shadow-inner border-2 border-gray-300 dark:border-gray-600" 
                style={{
                  background: `linear-gradient(to right, ${colorBox.fillColor}, ${colorBox.fillColor2 || '#FFFFFF'})`
                }}
              />
            </div>
          </>
        )}

        {/* Opacity */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Opacity: {Math.round(colorBox.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={colorBox.opacity}
            onChange={(e) => onUpdateColorBox(colorBox.id, { opacity: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Tip */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            💡 <strong>Tip:</strong> Use the eye dropper to pick colors from your image for seamless blending!
          </p>
        </div>
      </div>
    );
  }

  return null;
}