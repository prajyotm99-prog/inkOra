import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface TextBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fieldName: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  color: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
}

export interface ColorBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  fillColor2?: string;
  fillType: 'solid' | 'gradient';
  opacity: number;
}

export interface Template {
  id: string;
  name: string;
  imageData: string;
  thumbnail: string;
  width: number;
  height: number;
  textBoxes: TextBox[];
  colorBoxes: ColorBox[];
  createdAt: number;
  updatedAt: number;
}

interface InkOraDB extends DBSchema {
  templates: {
    key: string;
    value: Template;
  };
  settings: {
    key: string;
    value: any;
  };
}

let dbInstance: IDBPDatabase<InkOraDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<InkOraDB>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<InkOraDB>('inkora-db', 2, {
    upgrade(database, oldVersion, newVersion, transaction) {
      // Create templates store if it doesn't exist
      if (!database.objectStoreNames.contains('templates')) {
        database.createObjectStore('templates', { keyPath: 'id' });
      }
      
      // Create settings store if it doesn't exist
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings');
      }

      // Migration: Add timestamps to existing templates
      if (oldVersion < 2) {
        const templateStore = transaction.objectStore('templates');
        templateStore.openCursor().then(function cursorIterate(cursor) {
          if (!cursor) return;
          const template = cursor.value;
          if (!template.createdAt) {
            template.createdAt = Date.now();
            template.updatedAt = Date.now();
            cursor.update(template);
          }
          return cursor.continue().then(cursorIterate);
        });
      }
    },
  });
  
  return dbInstance;
}

// Template Operations
export async function saveTemplate(template: Template): Promise<void> {
  const database = await initDB();
  
  // Update timestamp
  const now = Date.now();
  const updatedTemplate = {
    ...template,
    updatedAt: now,
    createdAt: template.createdAt || now,
  };
  
  await database.put('templates', updatedTemplate);
}

export async function getTemplate(id: string): Promise<Template | undefined> {
  const database = await initDB();
  return await database.get('templates', id);
}

export async function getAllTemplates(): Promise<Template[]> {
  const database = await initDB();
  const templates = await database.getAll('templates');
  
  // Sort by most recently updated
  return templates.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteTemplate(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('templates', id);
}

export async function duplicateTemplate(id: string): Promise<Template> {
  const database = await initDB();
  const original = await database.get('templates', id);
  
  if (!original) {
    throw new Error('Template not found');
  }
  
  const now = Date.now();
  const duplicate: Template = {
    ...original,
    id: `template_${now}`,
    name: `${original.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
  };
  
  await database.put('templates', duplicate);
  return duplicate;
}

export async function updateTemplateName(id: string, name: string): Promise<void> {
  const database = await initDB();
  const template = await database.get('templates', id);
  
  if (template) {
    template.name = name;
    template.updatedAt = Date.now();
    await database.put('templates', template);
  }
}

export async function getTemplateCount(): Promise<number> {
  const database = await initDB();
  return await database.count('templates');
}

// Text Box Operations
export async function addTextBox(templateId: string, textBox: Omit<TextBox, 'id'>): Promise<void> {
  const database = await initDB();
  const template = await database.get('templates', templateId);
  
  if (template) {
    const newBox: TextBox = {
      ...textBox,
      id: `text_${Date.now()}`,
    };
    template.textBoxes.push(newBox);
    template.updatedAt = Date.now();
    await database.put('templates', template);
  }
}

export async function updateTextBox(templateId: string, boxId: string, updates: Partial<TextBox>): Promise<void> {
  const database = await initDB();
  const template = await database.get('templates', templateId);
  
  if (template) {
    const index = template.textBoxes.findIndex(box => box.id === boxId);
    if (index !== -1) {
      template.textBoxes[index] = { ...template.textBoxes[index], ...updates };
      template.updatedAt = Date.now();
      await database.put('templates', template);
    }
  }
}

export async function deleteTextBox(templateId: string, boxId: string): Promise<void> {
  const database = await initDB();
  const template = await database.get('templates', templateId);
  
  if (template) {
    template.textBoxes = template.textBoxes.filter(box => box.id !== boxId);
    template.updatedAt = Date.now();
    await database.put('templates', template);
  }
}

// Color Box Operations
export async function addColorBox(templateId: string, colorBox: Omit<ColorBox, 'id'>): Promise<void> {
  const database = await initDB();
  const template = await database.get('templates', templateId);
  
  if (template) {
    const newBox: ColorBox = {
      ...colorBox,
      id: `color_${Date.now()}`,
    };
    template.colorBoxes.push(newBox);
    template.updatedAt = Date.now();
    await database.put('templates', template);
  }
}

export async function updateColorBox(templateId: string, boxId: string, updates: Partial<ColorBox>): Promise<void> {
  const database = await initDB();
  const template = await database.get('templates', templateId);
  
  if (template) {
    const index = template.colorBoxes.findIndex(box => box.id === boxId);
    if (index !== -1) {
      template.colorBoxes[index] = { ...template.colorBoxes[index], ...updates };
      template.updatedAt = Date.now();
      await database.put('templates', template);
    }
  }
}

export async function deleteColorBox(templateId: string, boxId: string): Promise<void> {
  const database = await initDB();
  const template = await database.get('templates', templateId);
  
  if (template) {
    template.colorBoxes = template.colorBoxes.filter(box => box.id !== boxId);
    template.updatedAt = Date.now();
    await database.put('templates', template);
  }
}

export async function deleteBox(templateId: string, boxId: string): Promise<void> {
  await deleteTextBox(templateId, boxId);
  await deleteColorBox(templateId, boxId);
}

// Settings Operations
export async function saveSetting(key: string, value: any): Promise<void> {
  const database = await initDB();
  await database.put('settings', value, key);
}

export async function getSetting<T = any>(key: string): Promise<T | undefined> {
  const database = await initDB();
  return await database.get('settings', key);
}

export async function deleteSetting(key: string): Promise<void> {
  const database = await initDB();
  await database.delete('settings', key);
}

export async function getAllSettings(): Promise<Record<string, any>> {
  const database = await initDB();
  const keys = await database.getAllKeys('settings');
  const values = await database.getAll('settings');
  
  const settings: Record<string, any> = {};
  keys.forEach((key, index) => {
    settings[key as string] = values[index];
  });
  
  return settings;
}

// Utility Functions
export async function exportTemplates(): Promise<string> {
  const templates = await getAllTemplates();
  return JSON.stringify(templates, null, 2);
}

export async function importTemplates(jsonData: string): Promise<number> {
  const database = await initDB();
  const templates: Template[] = JSON.parse(jsonData);
  
  let imported = 0;
  for (const template of templates) {
    // Generate new ID to avoid conflicts
    template.id = `template_${Date.now()}_${imported}`;
    template.createdAt = Date.now();
    template.updatedAt = Date.now();
    await database.put('templates', template);
    imported++;
  }
  
  return imported;
}

export async function clearAllData(): Promise<void> {
  const database = await initDB();
  await database.clear('templates');
  await database.clear('settings');
}

export async function getStorageSize(): Promise<{ templates: number; settings: number; total: number }> {
  const database = await initDB();
  
  const templates = await database.getAll('templates');
  const settings = await database.getAll('settings');
  
  const templatesSize = JSON.stringify(templates).length;
  const settingsSize = JSON.stringify(settings).length;
  
  return {
    templates: templatesSize,
    settings: settingsSize,
    total: templatesSize + settingsSize,
  };
}