import { openDB, DBSchema, IDBPDatabase } from 'idb';

/* ============================
   MODELS
============================ */

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

/* ============================
   DATABASE SCHEMA
============================ */

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

/* ============================
   INIT DATABASE
============================ */

export async function initDB(): Promise<IDBPDatabase<InkOraDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<InkOraDB>('inkora-db', 2, {
    upgrade(database, oldVersion, _newVersion, transaction) {
      if (!database.objectStoreNames.contains('templates')) {
        database.createObjectStore('templates', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings');
      }

      // 🔁 MIGRATION: Add timestamps safely
      if (oldVersion < 2) {
        const store = transaction.objectStore('templates');

        store.openCursor().then((cursor) => {
          if (!cursor) return;

          const template = cursor.value;

          if (!template.createdAt) {
            const now = Date.now();
            template.createdAt = now;
            template.updatedAt = now;
            cursor.update(template);
          }

          cursor.continue();
        });
      }
    },
  });

  return dbInstance;
}

/* ============================
   TEMPLATE OPERATIONS
============================ */

export async function saveTemplate(template: Template): Promise<void> {
  const db = await initDB();
  const now = Date.now();

  await db.put('templates', {
    ...template,
    createdAt: template.createdAt || now,
    updatedAt: now,
  });
}

export async function getTemplate(id: string): Promise<Template | undefined> {
  const db = await initDB();
  return db.get('templates', id);
}

export async function getAllTemplates(): Promise<Template[]> {
  const db = await initDB();
  const templates = await db.getAll('templates');
  return templates.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteTemplate(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('templates', id);
}

export async function duplicateTemplate(id: string): Promise<Template> {
  const db = await initDB();
  const original = await db.get('templates', id);

  if (!original) throw new Error('Template not found');

  const now = Date.now();
  const copy: Template = {
    ...original,
    id: `template_${now}`,
    name: `${original.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
  };

  await db.put('templates', copy);
  return copy;
}

export async function updateTemplateName(id: string, name: string): Promise<void> {
  const db = await initDB();
  const template = await db.get('templates', id);

  if (!template) return;

  template.name = name;
  template.updatedAt = Date.now();
  await db.put('templates', template);
}

export async function getTemplateCount(): Promise<number> {
  const db = await initDB();
  return db.count('templates');
}

/* ============================
   TEXT BOX OPERATIONS
============================ */

export async function addTextBox(
  templateId: string,
  textBox: Omit<TextBox, 'id'>
): Promise<void> {
  const db = await initDB();
  const template = await db.get('templates', templateId);

  if (!template) return;

  template.textBoxes.push({
    ...textBox,
    id: `text_${Date.now()}`,
  });

  template.updatedAt = Date.now();
  await db.put('templates', template);
}

export async function updateTextBox(
  templateId: string,
  boxId: string,
  updates: Partial<TextBox>
): Promise<void> {
  const db = await initDB();
  const template = await db.get('templates', templateId);

  if (!template) return;

  const index = template.textBoxes.findIndex(b => b.id === boxId);
  if (index === -1) return;

  template.textBoxes[index] = {
    ...template.textBoxes[index],
    ...updates,
  };

  template.updatedAt = Date.now();
  await db.put('templates', template);
}

export async function deleteTextBox(templateId: string, boxId: string): Promise<void> {
  const db = await initDB();
  const template = await db.get('templates', templateId);

  if (!template) return;

  template.textBoxes = template.textBoxes.filter(b => b.id !== boxId);
  template.updatedAt = Date.now();
  await db.put('templates', template);
}

/* ============================
   COLOR BOX OPERATIONS
============================ */

export async function addColorBox(
  templateId: string,
  colorBox: Omit<ColorBox, 'id'>
): Promise<void> {
  const db = await initDB();
  const template = await db.get('templates', templateId);

  if (!template) return;

  template.colorBoxes.push({
    ...colorBox,
    id: `color_${Date.now()}`,
  });

  template.updatedAt = Date.now();
  await db.put('templates', template);
}

export async function updateColorBox(
  templateId: string,
  boxId: string,
  updates: Partial<ColorBox>
): Promise<void> {
  const db = await initDB();
  const template = await db.get('templates', templateId);

  if (!template) return;

  const index = template.colorBoxes.findIndex(b => b.id === boxId);
  if (index === -1) return;

  template.colorBoxes[index] = {
    ...template.colorBoxes[index],
    ...updates,
  };

  template.updatedAt = Date.now();
  await db.put('templates', template);
}

export async function deleteColorBox(templateId: string, boxId: string): Promise<void> {
  const db = await initDB();
  const template = await db.get('templates', templateId);

  if (!template) return;

  template.colorBoxes = template.colorBoxes.filter(b => b.id !== boxId);
  template.updatedAt = Date.now();
  await db.put('templates', template);
}

export async function deleteBox(templateId: string, boxId: string): Promise<void> {
  await deleteTextBox(templateId, boxId);
  await deleteColorBox(templateId, boxId);
}

/* ============================
   SETTINGS
============================ */

export async function saveSetting(key: string, value: any): Promise<void> {
  const db = await initDB();
  await db.put('settings', value, key);
}

export async function getSetting<T = any>(key: string): Promise<T | undefined> {
  const db = await initDB();
  return db.get('settings', key);
}

export async function deleteSetting(key: string): Promise<void> {
  const db = await initDB();
  await db.delete('settings', key);
}

export async function getAllSettings(): Promise<Record<string, any>> {
  const db = await initDB();
  const keys = await db.getAllKeys('settings');
  const values = await db.getAll('settings');

  const result: Record<string, any> = {};
  keys.forEach((k, i) => {
    result[k as string] = values[i];
  });

  return result;
}

/* ============================
   UTILITIES
============================ */

export async function exportTemplates(): Promise<string> {
  return JSON.stringify(await getAllTemplates(), null, 2);
}

export async function importTemplates(jsonData: string): Promise<number> {
  const db = await initDB();
  const templates: Template[] = JSON.parse(jsonData);

  let count = 0;
  for (const t of templates) {
    const now = Date.now();
    await db.put('templates', {
      ...t,
      id: `template_${now}_${count}`,
      createdAt: now,
      updatedAt: now,
    });
    count++;
  }

  return count;
}

export async function clearAllData(): Promise<void> {
  const db = await initDB();
  await db.clear('templates');
  await db.clear('settings');
}

export async function getStorageSize(): Promise<{
  templates: number;
  settings: number;
  total: number;
}> {
  const db = await initDB();

  const templates = await db.getAll('templates');
  const settings = await db.getAll('settings');

  const templatesSize = JSON.stringify(templates).length;
  const settingsSize = JSON.stringify(settings).length;

  return {
    templates: templatesSize,
    settings: settingsSize,
    total: templatesSize + settingsSize,
  };
}
