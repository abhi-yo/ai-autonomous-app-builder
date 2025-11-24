/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.tailwindcss.com https://sandpack.codesandbox.io https://stackblitz.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://sandpack.codesandbox.io https://unpkg.com https://stackblitz.com https://va.vercel-scripts.com https://*.webcontainer-api.io wss: ws:",
              "frame-src 'self' https://sandpack.codesandbox.io https://stackblitz.com https://*.webcontainer-api.io blob:",
              "worker-src 'self' blob:",
            ].join("; "),
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ]
  },
}

export default nextConfig
