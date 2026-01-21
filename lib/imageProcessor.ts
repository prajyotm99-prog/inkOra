export async function compressImage(
  imageData: string,
  targetSizeKB: number = 150
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      let { width, height } = img;
      const maxDimension = 2000;
      
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = width * ratio;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.9;
      let result = canvas.toDataURL('image/jpeg', quality);

      while (getBase64Size(result) > targetSizeKB && quality > 0.1) {
        quality -= 0.1;
        result = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(result);
    };
    img.src = imageData;
  });
}

export async function enhanceSmallImage(imageData: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.filter = 'contrast(1.1) brightness(1.05) saturate(1.1)';
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.src = imageData;
  });
}

function getBase64Size(base64: string): number {
  const stringLength = base64.length - 'data:image/jpeg;base64,'.length;
  const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
  return sizeInBytes / 1024;
}

export function createThumbnail(imageData: string, size: number = 200): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      const ratio = Math.min(size / img.width, size / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;

      canvas.width = size;
      canvas.height = size;

      const x = (size - width) / 2;
      const y = (size - height) / 2;

      ctx.drawImage(img, x, y, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = imageData;
  });
}