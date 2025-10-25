const path = require('path');

module.exports = {
  entry: {
    index: './src/index.ts',
    react: './src/react/index.ts',
    angular: './src/angular/index.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: 'CertifiedContent',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  externals: {
    'react': 'react',
    '@angular/core': '@angular/core'
  }
};
