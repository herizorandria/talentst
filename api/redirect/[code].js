import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  const { code } = req.query
  if (!code) {
    return res.status(400).send('Missing code')
  }

  try {
    const { data, error } = await supabase
      .from('urls')
      .select('original_url')
      .eq('short_code', code)
      .single()

    if (error || !data) {
      return res.status(404).send('Not found')
    }

    const target = data.original_url
    // Optional: increment clicks here (use a separate service role key)

    res.writeHead(307, { Location: target })
    return res.end()
  } catch (err) {
    console.error(err)
    return res.status(500).send('Server error')
  }
}
