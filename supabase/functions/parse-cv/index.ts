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

    console.log('File type:', fileType, 'File name:', fileName);

    // Handle text files
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      extractedText = await file.text();
      console.log('Text file parsed successfully, extracted', extractedText.length, 'characters');
    }
    // For PDF and DOCX files, inform user to use text input
    else if (
      fileType === 'application/pdf' || 
      fileName.endsWith('.pdf') ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      throw new Error(
        `PDF and DOCX parsing is temporarily unavailable. Please copy and paste your resume text instead. ` +
        `File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`
      );
    }
    else {
      throw new Error(
        `Unsupported file type: ${fileType || 'unknown'}. ` +
        `Supported formats: Plain text (.txt). ` +
        `For PDF or DOCX files, please copy and paste the text content instead. ` +
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
