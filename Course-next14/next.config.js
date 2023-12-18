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
    webpackDevMiddleware: (config) => {
        config.watchOptions.ignored = [/node_modules/];
        return config;
    },
}

module.exports = nextConfig
