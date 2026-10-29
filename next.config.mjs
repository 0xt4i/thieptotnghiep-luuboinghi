/** @type {import('next').NextConfig} */
const nextConfig = {
  // The OG image reads these fonts from disk at request time; make sure they ship with the function.
  experimental: { outputFileTracingIncludes: { "/i/[token]/opengraph-image": ["./assets/fonts/**"] } },
};
export default nextConfig;
