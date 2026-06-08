import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

const pdfWorker = new Worker(
  new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url),
  { type: 'module' }
);
pdfjsLib.GlobalWorkerOptions.workerPort = pdfWorker;

export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;

        if (file.type === 'application/pdf') {
          const text = await extractTextFromPdf(arrayBuffer);
          resolve(text);
        } else if (
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          file.name.endsWith('.docx')
        ) {
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } else if (file.type === 'text/plain') {
          const textReader = new FileReader();
          textReader.onload = (e) => resolve(e.target?.result as string);
          textReader.readAsText(file);
        } else {
          reject(new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.'));
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read the file'));
    reader.readAsArrayBuffer(file);
  });
};

const extractTextFromPdf = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  } catch (error: any) {
    console.error('PDF parsing error:', error);
    throw new Error(`PDF Error: ${error?.message || 'Unknown parsing error'}`);
  }
};

// Render PDF pages to images for vision-based AI extraction
export const extractImagesFromPdf = async (arrayBuffer: ArrayBuffer, maxPages: number = 20): Promise<Blob[]> => {
  try {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: Blob[] = [];
    const numPages = Math.min(pdf.numPages, maxPages);

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = new OffscreenCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
      pages.push(blob);
    }

    return pages;
  } catch (error: any) {
    console.error('PDF image extraction error:', error);
    throw new Error(`PDF Image Error: ${error?.message || 'Failed to render PDF pages'}`);
  }
};
