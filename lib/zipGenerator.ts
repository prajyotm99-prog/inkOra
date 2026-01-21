import JSZip from 'jszip';

export async function createZipFromImages(
  images: { name: string; data: string }[]
): Promise<Blob> {
  const zip = new JSZip();

  images.forEach(({ name, data }) => {
    const base64Data = data.split(',')[1];
    zip.file(name, base64Data, { base64: true });
  });

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadZip(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}