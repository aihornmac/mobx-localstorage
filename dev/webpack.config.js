const os = require('os')
const path = require('path')
const HappyPack = require('happypack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  mode: 'development',
  context: __dirname,
  entry: './entry.ts',
  output: {
    path: path.join(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        use: 'happypack/loader?id=ts',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HappyPack({
      id: 'ts',
      loaders: [
        {
          loader: 'ts-loader',
          options: {
            happyPackMode: true,
            transpileOnly: true,
          },
        },
      ],
      threadPool: HappyPack.ThreadPool({ size: os.cpus().length }),
    }),
    new HtmlWebpackPlugin({
      title: `Layout Dev Tool`,
      inject: true,
    }),
  ]
}
