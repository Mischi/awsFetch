import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'src/main.js',
  moduleName: 'awsFetch',
  format: 'umd',
  dest: 'dist/awsFetch.js',
  sourceMap: true,
  plugins: [
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [
        ["latest", {
          es2015: {
            modules: false
          }
        }]
      ]
    }),
    commonjs({
      namedExports: {
        'node_modules/crypto-js/sha256.js': [ 'SHA256' ],
        'node_modules/crypto-js/hmac-sha256.js': [ 'HmacSHA256' ]
      }
    }),
    resolve()
  ],
  external: ['node-fetch'],
  globals: {
    'node-fetch': 'fetch'
  }
};
