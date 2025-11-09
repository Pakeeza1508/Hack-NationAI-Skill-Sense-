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

    // Handle text files
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      extractedText = await file.text();
      console.log('Text file parsed successfully');
    }
    // For PDF and DOCX files, use the Lovable AI document parsing API
    else if (
      file.type === 'application/pdf' || 
      file.name.endsWith('.pdf') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      
      if (!LOVABLE_API_KEY) {
        throw new Error('Document parsing is not configured. Please contact support.');
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        const parseResponse = await fetch('https://ai.gateway.lovable.dev/v1/parse-document', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: {
              name: file.name,
              content: base64Content,
              mimeType: file.type,
            },
          }),
        });

        if (!parseResponse.ok) {
          const errorText = await parseResponse.text();
          console.error('Document parsing error:', parseResponse.status, errorText);
          throw new Error(`Failed to parse document: ${parseResponse.status}`);
        }

        const parseResult = await parseResponse.json();
        extractedText = parseResult.text || '';
        console.log('Document parsed successfully, extracted', extractedText.length, 'characters');
      } catch (parseError) {
        console.error('Document parsing error:', parseError);
        throw new Error('Failed to parse document. Please ensure it is a valid PDF or DOCX file.');
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
