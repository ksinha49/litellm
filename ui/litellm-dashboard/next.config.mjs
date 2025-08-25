/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: '',
    assetPrefix: '/litellm-asset-prefix',  // If a server_root_path is set, this will be overridden by runtime injection
    env: {
        // Default logo bundled with the UI; can be overridden at build time
        NEXT_PUBLIC_LOGO_PATH: '/favicon.png',
    },
    images: {
        unoptimized: true,
    }
};

nextConfig.experimental = {
    missingSuspenseWithCSRBailout: false
}

export default nextConfig;
