module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist',
  },
  optimization: {
    minimize: true,
    usedExports: true,
  },
};
