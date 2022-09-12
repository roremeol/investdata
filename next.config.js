const withSass = require("@zeit/next-sass");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  sassOptions:withSass({
    target: 'serverless',
    reactStrictMode: true,
    swcMinify: true,
    env: {
      JWT_SECRET: `JWT_SECRET`
    }
  })
}

module.exports = nextConfig
