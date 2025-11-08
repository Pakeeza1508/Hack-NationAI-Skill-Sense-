import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Use ESM module for PDF parsing
const pdfParse = (await import("https://esm.sh/pdf-parse@1.1.1")).default;

// Import DOCX parsing library
const mammoth = (await import("https://esm.sh/mammoth@1.6.0")).default;

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

    // Handle PDF files
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      
      try {
        const data = await pdfParse(buffer);
        extractedText = data.text;
        console.log('PDF parsed successfully, extracted', extractedText.length, 'characters');
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        throw new Error('Failed to parse PDF file. Please ensure it is a valid PDF.');
      }
    } 
    // Handle text files
    else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      extractedText = await file.text();
      console.log('Text file parsed successfully');
    }
    // Handle Word documents
    else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
        console.log('DOCX parsed successfully, extracted', extractedText.length, 'characters');
      } catch (docxError) {
        console.error('DOCX parsing error:', docxError);
        throw new Error('Failed to parse Word document. Please ensure it is a valid DOCX file.');
      }
    }
    else {
      throw new Error('Unsupported file type. Please upload a PDF, DOCX, or text file.');
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
