import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password, hash } = await req.json();

    if (!password || !hash || typeof password !== 'string' || typeof hash !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Password and hash are required and must be strings' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify password against hash using bcrypt
    const valid = await bcrypt.compare(password, hash);

    console.log('Password verification completed');

    return new Response(
      JSON.stringify({ valid }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error verifying password:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error during password verification' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})