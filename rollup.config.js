import browsersync from 'rollup-plugin-browsersync';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default [{
  input: 'index2.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'bouffon'
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    browsersync(),
  ]
}];
