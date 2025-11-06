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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.tailwindcss.com https://sandpack.codesandbox.io",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://sandpack.codesandbox.io https://unpkg.com",
              "frame-src 'self' https://sandpack.codesandbox.io blob:",
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ]
  },
}

export default nextConfig
