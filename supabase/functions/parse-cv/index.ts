import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type');
    
    if (!contentType?.includes('multipart/form-data')) {
      throw new Error('Content-Type must be multipart/form-data');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log('Parsing file:', file.name, 'Size:', file.size);

    let extractedText = '';
    const fileType = file.type || '';
    const fileName = file.name.toLowerCase();

    console.log('File type:', fileType, 'File name:', fileName, 'Size:', (file.size / 1024).toFixed(2), 'KB');

    // Handle PDF files using pdf.js from CDN
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Dynamically import pdf.js
        const pdfjsModule = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.mjs');
        const pdfjsLib = pdfjsModule.default || pdfjsModule;
        
        // Set worker source
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs';
        
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        
        console.log('PDF loaded, pages:', pdf.numPages);
        
        // Extract text from all pages
        const textParts: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          textParts.push(pageText);
        }
        
        extractedText = textParts.join('\n\n');
        console.log('PDF parsed successfully, extracted', extractedText.length, 'characters from', pdf.numPages, 'pages');
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        throw new Error(`Failed to parse PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}. File: ${file.name}`);
      }
    }
    // Handle text files
    else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      extractedText = await file.text();
      console.log('Text file parsed successfully, extracted', extractedText.length, 'characters');
    }
    // Handle DOCX files - inform user these aren't supported yet
    else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      throw new Error(
        `DOCX file support is coming soon. For now, please save your document as PDF or copy the text. ` +
        `File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`
      );
    }
    else {
      throw new Error(
        `Unsupported file type: ${fileType || 'unknown'}. ` +
        `Supported formats: PDF (.pdf) and Plain text (.txt). ` +
        `File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the file');
    }

    return new Response(
      JSON.stringify({ 
        text: extractedText,
        fileName: file.name,
        fileSize: file.size
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in parse-cv function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to parse file' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
