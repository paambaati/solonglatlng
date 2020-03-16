const withImages = require('next-images');

// From https://tailwindcss.com/docs/controlling-file-size/#setting-up-purgecss
const purgecss = [
    '@fullhuman/postcss-purgecss', {
        content: ['./components/**/*.tsx', './pages/**/*.tsx'],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    }
];

nextConfig = {
    plugins: [
        'postcss-import',
        'tailwindcss',
        'autoprefixer',
        ...(process.env.NODE_ENV === 'production' ? [purgecss] : [])
    ],
    devIndicators: {
        autoPrerender: false,
    },
    serverRuntimeConfig: {
        PROJECT_ROOT: __dirname,
    },
};

exports = module.exports = withImages(nextConfig);
