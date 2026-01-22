'use client';

import { useRef, useEffect, useState } from 'react';
import { Template, TextBox, ColorBox } from '@/lib/db';

interface TemplateCanvasProps {
  template: Template;
  mode: 'select' | 'text' | 'color';
  selectedBox: string | null;
  onSelectBox: (id: string | null) => void;
  onAddTextBox: (box: Omit<TextBox, 'id'>) => void;
  onAddColorBox: (box: Omit<ColorBox, 'id'>) => void;
  onUpdateTextBox: (id: string, updates: Partial<TextBox>) => void;
  onUpdateColorBox: (id: string, updates: Partial<ColorBox>) => void;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

export default function TemplateCanvas({
  template,
  mode,
  selectedBox,
  onSelectBox,
  onAddTextBox,
  onAddColorBox,
  onUpdateTextBox,
  onUpdateColorBox,
}: TemplateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    drawCanvas();
  }, [template, selectedBox, isDrawing, currentPoint, isDragging, isResizing]);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const maxWidth = container.clientWidth - 40;
      const maxHeight = window.innerHeight * 0.7;
      
      const scaleX = maxWidth / template.width;
      const scaleY = maxHeight / template.height;
      const newScale = Math.min(scaleX, scaleY, 1);
      
      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [template.width, template.height]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, template.width, template.height);

      // Draw color boxes
      template.colorBoxes.forEach((box) => {
        if (box.fillType === 'gradient' && box.fillColor2) {
          const gradient = ctx.createLinearGradient(box.x, box.y, box.x + box.width, box.y);
          gradient.addColorStop(0, box.fillColor);
          gradient.addColorStop(1, box.fillColor2);
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = box.fillColor;
        }
        
        ctx.globalAlpha = box.opacity;
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.globalAlpha = 1;

        const isSelected = selectedBox === box.id;
        ctx.strokeStyle = isSelected ? '#F5A623' : '#F5A62350';
        ctx.lineWidth = 2 / scale;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        if (isSelected && mode === 'select') {
          drawResizeHandles(ctx, box.x, box.y, box.width, box.height);
        }
      });

      // Draw text boxes
      template.textBoxes.forEach((box) => {
        const isSelected = selectedBox === box.id;
        
        if (box.backgroundColor) {
          ctx.fillStyle = box.backgroundColor;
          ctx.globalAlpha = box.backgroundOpacity || 1;
          ctx.fillRect(box.x, box.y, box.width, box.height);
          ctx.globalAlpha = 1;
        }
        
        ctx.strokeStyle = isSelected ? '#4A90E2' : '#4A90E250';
        ctx.lineWidth = 2 / scale;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        ctx.save();
        ctx.font = `${box.fontWeight} ${box.fontSize}px ${box.fontFamily}`;
        ctx.fillStyle = box.color + '80';
        
        let textX = box.x;
        const textY = box.y + box.fontSize;
        
        if (box.textAlign === 'center') {
          ctx.textAlign = 'center';
          textX = box.x + box.width / 2;
        } else if (box.textAlign === 'right') {
          ctx.textAlign = 'right';
          textX = box.x + box.width;
        } else {
          ctx.textAlign = 'left';
          textX = box.x + 5;
        }
        
        ctx.fillText(box.fieldName, textX, textY);
        ctx.restore();

        const labelFontSize = Math.max(14, Math.min(template.width / 50, 20));
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.font = `bold ${labelFontSize}px sans-serif`;
        const labelY = box.y - 10;
        ctx.strokeText(box.fieldName, box.x, labelY);
        ctx.fillText(box.fieldName, box.x, labelY);

        if (isSelected && mode === 'select') {
          drawResizeHandles(ctx, box.x, box.y, box.width, box.height);
        }
      });

      // Draw current drawing
      if (isDrawing && mode !== 'select') {
        const width = currentPoint.x - startPoint.x;
        const height = currentPoint.y - startPoint.y;

        ctx.save();
        ctx.setLineDash([5, 5]);
        
        if (mode === 'text') {
          ctx.strokeStyle = '#4A90E2';
          ctx.lineWidth = 2;
          ctx.strokeRect(startPoint.x, startPoint.y, width, height);
        } else if (mode === 'color') {
          ctx.fillStyle = '#F5A62340';
          ctx.fillRect(startPoint.x, startPoint.y, width, height);
          ctx.strokeStyle = '#F5A623';
          ctx.lineWidth = 2;
          ctx.strokeRect(startPoint.x, startPoint.y, width, height);
        }
        
        ctx.restore();
      }
    };
    img.src = template.imageData;
  };

  const drawResizeHandles = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    const handleSize = 8 / scale;
    const handles = [
      { x: x, y: y },
      { x: x + w, y: y },
      { x: x, y: y + h },
      { x: x + w, y: y + h },
      { x: x + w / 2, y: y },
      { x: x + w / 2, y: y + h },
      { x: x, y: y + h / 2 },
      { x: x + w, y: y + h / 2 },
    ];

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#4A90E2';
    ctx.lineWidth = 2 / scale;

    handles.forEach((handle) => {
      ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    });
  };

  // FIXED: Get point from both mouse and touch events
  const getCanvasPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * template.width,
      y: ((clientY - rect.top) / rect.height) * template.height,
    };
  };

  const getResizeHandle = (point: { x: number; y: number }, box: any): ResizeHandle | null => {
    const handleSize = 12;
    const handles: { handle: ResizeHandle; x: number; y: number }[] = [
      { handle: 'nw', x: box.x, y: box.y },
      { handle: 'ne', x: box.x + box.width, y: box.y },
      { handle: 'sw', x: box.x, y: box.y + box.height },
      { handle: 'se', x: box.x + box.width, y: box.y + box.height },
      { handle: 'n', x: box.x + box.width / 2, y: box.y },
      { handle: 's', x: box.x + box.width / 2, y: box.y + box.height },
      { handle: 'w', x: box.x, y: box.y + box.height / 2 },
      { handle: 'e', x: box.x + box.width, y: box.y + box.height / 2 },
    ];

    for (const h of handles) {
      if (
        Math.abs(point.x - h.x) < handleSize &&
        Math.abs(point.y - h.y) < handleSize
      ) {
        return h.handle;
      }
    }
    return null;
  };

  // FIXED: Unified start handler for mouse and touch
  const handleStart = (clientX: number, clientY: number) => {
    const point = getCanvasPoint(clientX, clientY);

    if (mode === 'select' && selectedBox) {
      const selectedTextBox = template.textBoxes.find(b => b.id === selectedBox);
      const selectedColorBox = template.colorBoxes.find(b => b.id === selectedBox);
      const box = selectedTextBox || selectedColorBox;

      if (box) {
        const handle = getResizeHandle(point, box);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          setStartPoint(point);
          return;
        }

        if (
          point.x >= box.x &&
          point.x <= box.x + box.width &&
          point.y >= box.y &&
          point.y <= box.y + box.height
        ) {
          setIsDragging(true);
          setDragStart({ x: point.x - box.x, y: point.y - box.y });
          return;
        }
      }
    }

    if (mode === 'select') {
      let clicked = false;

      for (const box of [...template.textBoxes].reverse()) {
        if (
          point.x >= box.x &&
          point.x <= box.x + box.width &&
          point.y >= box.y &&
          point.y <= box.y + box.height
        ) {
          onSelectBox(box.id);
          clicked = true;
          break;
        }
      }

      if (!clicked) {
        for (const box of [...template.colorBoxes].reverse()) {
          if (
            point.x >= box.x &&
            point.x <= box.x + box.width &&
            point.y >= box.y &&
            point.y <= box.y + box.height
          ) {
            onSelectBox(box.id);
            clicked = true;
            break;
          }
        }
      }

      if (!clicked) {
        onSelectBox(null);
      }
    } else {
      setIsDrawing(true);
      setStartPoint(point);
      setCurrentPoint(point);
    }
  };

  // FIXED: Unified move handler for mouse and touch
  const handleMove = (clientX: number, clientY: number) => {
    const point = getCanvasPoint(clientX, clientY);

    if (isDragging && selectedBox) {
      const selectedTextBox = template.textBoxes.find(b => b.id === selectedBox);
      const selectedColorBox = template.colorBoxes.find(b => b.id === selectedBox);
      
      if (selectedTextBox) {
        onUpdateTextBox(selectedBox, {
          x: point.x - dragStart.x,
          y: point.y - dragStart.y,
        });
      } else if (selectedColorBox) {
        onUpdateColorBox(selectedBox, {
          x: point.x - dragStart.x,
          y: point.y - dragStart.y,
        });
      }
    } else if (isResizing && selectedBox && resizeHandle) {
      const selectedTextBox = template.textBoxes.find(b => b.id === selectedBox);
      const selectedColorBox = template.colorBoxes.find(b => b.id === selectedBox);
      const box = selectedTextBox || selectedColorBox;

      if (box) {
        const dx = point.x - startPoint.x;
        const dy = point.y - startPoint.y;
        let updates: any = {};

        switch (resizeHandle) {
          case 'se':
            updates = { width: box.width + dx, height: box.height + dy };
            break;
          case 'nw':
            updates = { x: box.x + dx, y: box.y + dy, width: box.width - dx, height: box.height - dy };
            break;
          case 'ne':
            updates = { y: box.y + dy, width: box.width + dx, height: box.height - dy };
            break;
          case 'sw':
            updates = { x: box.x + dx, width: box.width - dx, height: box.height + dy };
            break;
          case 'e':
            updates = { width: box.width + dx };
            break;
          case 'w':
            updates = { x: box.x + dx, width: box.width - dx };
            break;
          case 'n':
            updates = { y: box.y + dy, height: box.height - dy };
            break;
          case 's':
            updates = { height: box.height + dy };
            break;
        }

        if (updates.width && updates.width < 20) updates.width = 20;
        if (updates.height && updates.height < 20) updates.height = 20;

        if (selectedTextBox) {
          onUpdateTextBox(selectedBox, updates);
        } else if (selectedColorBox) {
          onUpdateColorBox(selectedBox, updates);
        }

        setStartPoint(point);
      }
    } else if (isDrawing) {
      setCurrentPoint(point);
    }
  };

  // FIXED: Unified end handler
  const handleEnd = () => {
    if (isDragging) {
      setIsDragging(false);
    } else if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
    } else if (isDrawing) {
      const width = Math.abs(currentPoint.x - startPoint.x);
      const height = Math.abs(currentPoint.y - startPoint.y);
      const x = Math.min(startPoint.x, currentPoint.x);
      const y = Math.min(startPoint.y, currentPoint.y);

      if (width >= 20 && height >= 20) {
        if (mode === 'text') {
          onAddTextBox({
            x,
            y,
            width,
            height,
            fieldName: `Field ${template.textBoxes.length + 1}`,
            fontFamily: 'sans-serif',
            fontSize: Math.min(height * 0.6, 48),
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#000000',
          });
        } else if (mode === 'color') {
          onAddColorBox({
            x,
            y,
            width,
            height,
            fillColor: '#FFFFFF',
            fillType: 'solid',
            opacity: 1,
          });
        }
      }

      setIsDrawing(false);
    }
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // FIXED: Touch event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    handleEnd();
  };

  const getCursor = () => {
    if (mode === 'select') {
      if (isDragging) return 'move';
      if (isResizing) {
        switch (resizeHandle) {
          case 'nw': case 'se': return 'nwse-resize';
          case 'ne': case 'sw': return 'nesw-resize';
          case 'n': case 's': return 'ns-resize';
          case 'e': case 'w': return 'ew-resize';
        }
      }
      return 'default';
    }
    return 'crosshair';
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={template.width}
        height={template.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDrawing(false);
          setIsDragging(false);
          setIsResizing(false);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          setIsDrawing(false);
          setIsDragging(false);
          setIsResizing(false);
        }}
        className="border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg touch-none"
        style={{
          cursor: getCursor(),
          width: `${template.width * scale}px`,
          height: `${template.height * scale}px`,
        }}
      />
    </div>
  );
}
