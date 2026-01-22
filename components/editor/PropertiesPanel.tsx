'use client';

import { useState, useEffect, useRef } from 'react';
import { Template, TextBox, ColorBox } from '@/lib/db';
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
  // NEW: Eyedropper integration
  onActivateEyedropper?: (target: 'textColor' | 'fillColor' | 'fillColor2' | 'backgroundColor') => void;
  isEyedropperActive?: boolean;
}

export default function PropertiesPanel({
  selectedBox,
  textBox,
  colorBox,
  onUpdateTextBox,
  onUpdateColorBox,
  onDelete,
  onActivateEyedropper,
  isEyedropperActive = false,
}: PropertiesPanelProps) {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [hasBackground, setHasBackground] = useState(!!textBox?.backgroundColor);
  const [fillType, setFillType] = useState<'solid' | 'gradient'>(colorBox?.fillType || 'solid');

  // Update hasBackground when textBox changes
  useEffect(() => {
    setHasBackground(!!textBox?.backgroundColor);
  }, [textBox]);

  // Update fillType when colorBox changes
  useEffect(() => {
    setFillType(colorBox?.fillType || 'solid');
  }, [colorBox]);

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

        {/* Text Color with Eyedropper */}
        <ColorPickerPanel
          color={textBox.color}
          onChange={(color) => onUpdateTextBox(textBox.id, { color })}
          label="Text Color"
          showEyeDropper={true}
          onActivateCanvasEyedropper={() => onActivateEyedropper?.('textColor')}
          isEyedropperActive={isEyedropperActive}
        />

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
            <ColorPickerPanel
              color={textBox.backgroundColor || '#FFFFFF'}
              onChange={(color) => onUpdateTextBox(textBox.id, { backgroundColor: color })}
              label="Background Color"
              showEyeDropper={true}
              onActivateCanvasEyedropper={() => onActivateEyedropper?.('backgroundColor')}
              isEyedropperActive={isEyedropperActive}
            />

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

        {/* Color Pickers with Eyedropper */}
        {fillType === 'solid' ? (
          <ColorPickerPanel
            color={colorBox.fillColor}
            onChange={(color) => onUpdateColorBox(colorBox.id, { fillColor: color })}
            label="Fill Color"
            showEyeDropper={true}
            onActivateCanvasEyedropper={() => onActivateEyedropper?.('fillColor')}
            isEyedropperActive={isEyedropperActive}
          />
        ) : (
          <>
            <ColorPickerPanel
              color={colorBox.fillColor}
              onChange={(color) => onUpdateColorBox(colorBox.id, { fillColor: color })}
              label="Gradient Start"
              showEyeDropper={true}
              onActivateCanvasEyedropper={() => onActivateEyedropper?.('fillColor')}
              isEyedropperActive={isEyedropperActive}
            />
            
            <ColorPickerPanel
              color={colorBox.fillColor2 || '#FFFFFF'}
              onChange={(color) => onUpdateColorBox(colorBox.id, { fillColor2: color })}
              label="Gradient End"
              showEyeDropper={true}
              onActivateCanvasEyedropper={() => onActivateEyedropper?.('fillColor2')}
              isEyedropperActive={isEyedropperActive}
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
            💡 <strong>Tip:</strong> Use "Pick from Image" to sample colors directly from your template!
          </p>
        </div>
      </div>
    );
  }

  return null;
}