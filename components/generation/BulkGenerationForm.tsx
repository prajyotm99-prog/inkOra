'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Template } from '@/lib/db';
import { createZipFromImages, downloadZip } from '@/lib/zipGenerator';
import Button from '@/components/ui/Button';

interface BulkGenerationFormProps {
  template: Template;
}

interface CSVRow {
  [key: string]: string;
}

export default function BulkGenerationForm({ template }: BulkGenerationFormProps) {
  const [csvData, setCSVData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCSVHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [completed, setCompleted] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum 5MB.');
      return;
    }

    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      // Handle CSV
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const data = results.data as CSVRow[];
          const validData = data.filter((row) => Object.values(row).some((val) => val));

          if (validData.length === 0) {
            alert('File is empty');
            return;
          }

          if (validData.length > 1000) {
            alert('Maximum 1000 rows allowed');
            return;
          }

          setCSVData(validData);
          setCSVHeaders(Object.keys(validData[0]));
          
          const autoMapping: Record<string, string> = {};
          template.textBoxes.forEach((box) => {
            const matchingHeader = Object.keys(validData[0]).find(
              (header) => header.toLowerCase() === box.fieldName.toLowerCase()
            );
            if (matchingHeader) {
              autoMapping[box.id] = matchingHeader;
            }
          });
          setMapping(autoMapping);
        },
        error: (error) => {
          console.error('CSV parse error:', error);
          alert('Failed to parse CSV file');
        },
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Handle Excel
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as CSVRow[];

          if (jsonData.length === 0) {
            alert('Excel file is empty');
            return;
          }

          if (jsonData.length > 1000) {
            alert('Maximum 1000 rows allowed');
            return;
          }

          setCSVData(jsonData);
          setCSVHeaders(Object.keys(jsonData[0]));
          
          const autoMapping: Record<string, string> = {};
          template.textBoxes.forEach((box) => {
            const matchingHeader = Object.keys(jsonData[0]).find(
              (header) => header.toLowerCase() === box.fieldName.toLowerCase()
            );
            if (matchingHeader) {
              autoMapping[box.id] = matchingHeader;
            }
          });
          setMapping(autoMapping);
        } catch (error) {
          console.error('Excel parse error:', error);
          alert('Failed to parse Excel file');
        }
      };
      reader.readAsBinaryString(file);
    } else {
      alert('Please upload a CSV or Excel file');
    }
  };

  const handleGenerate = async () => {
    const unmapped = template.textBoxes.filter((box) => !mapping[box.id]);
    if (unmapped.length > 0) {
      alert(`Please map all fields: ${unmapped.map((b) => b.fieldName).join(', ')}`);
      return;
    }

    setGenerating(true);
    setProgress({ current: 0, total: csvData.length });

    try {
      const images: { name: string; data: string }[] = [];

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        
        const canvas = document.createElement('canvas');
        canvas.width = template.width;
        canvas.height = template.height;
        const ctx = canvas.getContext('2d')!;

        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);

            template.colorBoxes.forEach((box) => {
              ctx.fillStyle = box.fillColor;
              ctx.globalAlpha = box.opacity;
              ctx.fillRect(box.x, box.y, box.width, box.height);
              ctx.globalAlpha = 1;
            });

            template.textBoxes.forEach((box) => {
              const csvColumn = mapping[box.id];
              const text = row[csvColumn] || '';
              
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

            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            
            const nameField = template.textBoxes[0];
            const nameColumn = mapping[nameField.id];
            const name = row[nameColumn] || `invitation_${i + 1}`;
            const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
            
            images.push({
              name: `${String(i + 1).padStart(3, '0')}_${safeName}.jpg`,
              data: dataUrl,
            });

            setProgress({ current: i + 1, total: csvData.length });
            resolve();
          };
          img.src = template.imageData;
        });

        if (i % 5 === 0) {
          await new Promise((r) => setTimeout(r, 10));
        }
      }

      const zipBlob = await createZipFromImages(images);
      const filename = `inkora_invitations_${new Date().toISOString().split('T')[0]}.zip`;
      downloadZip(zipBlob, filename);

      setCompleted(true);
      setGenerating(false);
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate invitations: ' + error);
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {csvData.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-medium mb-4">Upload CSV or Excel File</h2>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <div className="mb-4">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-lg font-medium mb-2">Click to upload file</p>
              <p className="text-sm text-gray-500">CSV or Excel (XLSX, XLS)</p>
              <p className="text-xs text-gray-400 mt-1">Max 5MB, up to 1000 rows</p>
            </label>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2">
              📋 File Requirements:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>✓ First row must contain column headers</li>
              <li>✓ Each row represents one invitation</li>
              <li>✓ Column names matching your fields will auto-map</li>
            </ul>
          </div>
        </div>
      )}

      {/* Preview & Mapping Section */}
      {csvData.length > 0 && !generating && !completed && (
        <div className="space-y-6">
          {/* CSV Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-medium">Data Preview</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {csvData.length} rows loaded
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCSVData([]);
                  setCSVHeaders([]);
                  setMapping({});
                  setCompleted(false);
                }}
              >
                🔄 Change File
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    {csvHeaders.map((header) => (
                      <th key={header} className="px-4 py-2 text-left font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 3).map((row, i) => (
                    <tr key={i} className="border-b border-gray-200 dark:border-gray-800">
                      {csvHeaders.map((header) => (
                        <td key={header} className="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {csvData.length > 3 && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                ... and {csvData.length - 3} more rows
              </p>
            )}
          </div>

          {/* Column Mapping */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-medium mb-4">Map Columns to Fields</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Match each template field to a column from your file
            </p>
            
            <div className="space-y-4">
              {template.textBoxes.map((box) => (
                <div key={box.id} className="flex items-center gap-4">
                  <div className="w-1/3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {box.fieldName}
                    </label>
                  </div>
                  <div className="flex-1">
                    <select
                      value={mapping[box.id] || ''}
                      onChange={(e) => setMapping({ ...mapping, [box.id]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select column...</option>
                      {csvHeaders.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                  {mapping[box.id] && (
                    <span className="text-green-500 text-sm">✓</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Fields mapped: {Object.keys(mapping).length} / {template.textBoxes.length}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Total invitations: {csvData.length}
                </span>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              className="w-full mt-6"
              disabled={Object.keys(mapping).length !== template.textBoxes.length}
            >
              🚀 Generate {csvData.length} Invitations
            </Button>
          </div>
        </div>
      )}

      {/* Progress Section */}
      {generating && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-medium mb-4">Generating Invitations...</h2>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{progress.current} / {progress.total} completed</span>
              <span className="font-medium text-primary">{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Please don't close this page...</span>
          </div>
        </div>
      )}

      {/* Completion Section */}
      {completed && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-medium mb-2">All Done! 🎉</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Successfully generated <span className="font-bold text-primary">{csvData.length}</span> invitations
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Your ZIP file has been downloaded
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => {
                setCSVData([]);
                setCSVHeaders([]);
                setMapping({});
                setCompleted(false);
              }} 
              variant="primary"
            >
              Generate More
            </Button>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="secondary"
            >
              Go Home
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}