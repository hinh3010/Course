/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            "upload.wikimedia.org",
            "example.com",
            "*",
            "static-cse.canva.com"
        ]
    },
    env: {
        BASE_URL: process.env.BASE_URL
    },
}

module.exports = nextConfig
