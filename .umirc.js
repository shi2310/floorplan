import { resolve } from 'path';

export default {
  define: {
    'process.env.API': process.env.API,
  },
  plugins: [
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: true,
        dynamicImport: true,
        title: 'overlaymaps',
        dll: true,
        // hardSource: true,
        routes: {
          exclude: [
            /models\//,
            /services\//,
            /model\.(t|j)sx?$/,
            /service\.(t|j)sx?$/,
            /components\//,
          ],
        },
      },
    ],
  ],
  hash: true,
  history: 'hash',
  proxy: {
    '/api': {
      target: 'http://localhost:8000/',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
  alias: {
    utils: resolve(__dirname, 'src/utils'),
    overlay: resolve(__dirname, 'src/overlay'),
    assets: resolve(__dirname, 'src/assets'),
    services: resolve(__dirname, 'src/services'),
    config: resolve(__dirname, 'src/config.js'),
    components: resolve(__dirname, 'src/components'),
  },
};
