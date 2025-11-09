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
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

    let text = '';

    // Handle PDF files using built-in text extraction
    if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Simple text extraction - convert bytes to text
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const pdfContent = decoder.decode(uint8Array);
        
        // Extract text between parentheses (common in PDF text objects)
        const textMatches = pdfContent.match(/\((.*?)\)/g);
        if (textMatches) {
          textMatches.forEach(match => {
            const extracted = match.replace(/[()]/g, '').trim();
            if (extracted && extracted.length > 2) {
              text += extracted + ' ';
            }
          });
        }
        
        if (!text || text.trim().length < 50) {
          throw new Error('Could not extract enough text from PDF. Please ensure it is a text-based PDF, not a scanned image.');
        }
        
        console.log('Successfully extracted text from PDF, length:', text.length);
      } catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error(`Failed to parse PDF. Please try converting to TXT or copying the text manually.`);
      }
    }
    // Handle text files
    else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      text = await file.text();
      console.log('Successfully read text file, length:', text.length);
    }
    else {
      throw new Error(`Unsupported file type: ${file.type}. Please upload PDF or TXT files, or paste text directly.`);
    }

    // Clean up the extracted text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!text || text.length < 10) {
      throw new Error('Extracted text is too short or empty. Please check your file or paste text directly.');
    }

    return new Response(
      JSON.stringify({ text }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in parse-cv function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
