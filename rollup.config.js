import resolve from 'rollup-plugin-node-resolve';
import browsersync from 'rollup-plugin-browsersync';

export default [{
  input: 'src/index.js',
  output: {
    file: 'index.js',
    format: 'iife',
  },
  plugins: [
    resolve(),
    process.env.ROLLUP_WATCH ? browsersync() : null
  ]
}];
