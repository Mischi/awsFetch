import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/main.js',
  moduleName: 'aws-fetch',
  format: 'umd',
  dest: 'dist/aws-fetch.js',
  sourceMap: true,
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
