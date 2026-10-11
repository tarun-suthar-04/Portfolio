/** @type {import('next').NextConfig} */
const path = require("node:path");

const nextConfig = {
  // Pin tracing to this app because a parent package-lock.json exists in the
  // user's home directory and can otherwise be mistaken for the workspace.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

module.exports = nextConfig;
