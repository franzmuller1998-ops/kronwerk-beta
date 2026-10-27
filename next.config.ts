import type { NextConfig } from 'next'
// standalone: `next build` also emits a self-contained server (.next/standalone) that the Dockerfile runs on Timeweb Cloud.
const nextConfig: NextConfig = { reactStrictMode:true, devIndicators:false, output:'standalone' }
export default nextConfig
