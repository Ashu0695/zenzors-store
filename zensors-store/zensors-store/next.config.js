/** @type {import('next').NextConfig} */
module.exports = {
  images: { remotePatterns: [{ protocol:'https', hostname:'*.supabase.co' },{ protocol:'https', hostname:'images.unsplash.com' }] },
}
