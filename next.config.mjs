/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow all local network origins for mobile testing
  devIndicators: {
    appIsrStatus: false,
  },
  // Ensure the dev server accepts incoming requests on all interfaces
  serverExternalPackages: ['groq-sdk'],
};

export default nextConfig;

