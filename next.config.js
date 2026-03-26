/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/invoice", destination: "/app/invoice", permanent: false },
      { source: "/invoices", destination: "/app/invoices", permanent: false },
      { source: "/history", destination: "/app/invoices", permanent: false },
      { source: "/print", destination: "/app/print", permanent: false },
      { source: "/analytics", destination: "/app/analytics", permanent: false },
      { source: "/master", destination: "/app/master", permanent: false },
      { source: "/settings", destination: "/app/settings", permanent: false },
      { source: "/dashboard", destination: "/app", permanent: false },
    ];
  },
};

module.exports = nextConfig;
