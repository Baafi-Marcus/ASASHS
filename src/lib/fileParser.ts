import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker for pdfjs using Vite's URL resolution
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

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
          // It's a text file, just read it as text
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
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Could not extract text from PDF');
  }
};
