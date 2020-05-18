const path = require('path');
const HTMLWebpackPluin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPLugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all',
    },
  };

  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetsWebpackPlugin(),
      new TerserWebpackPlugin(),
    ];
  }
  return config;
};

module.exports = {
  devtool: 'eval',
  context: path.resolve(__dirname, 'src'), // адрес, где лежат все исходники
  mode: 'development',
  entry: ['@babel/polyfill', './js/index.js'], // если независимая точка входа одна
  // entry: { // если нужно несколько независимых точек входа
  //     main: './src/js/index.js',
  //     second: '...path'
  // },
  output: {
    filename: 'bundle.[contenthash].js', // если точка входа одна
    // filename: '[name].bundle.js', // если точек входа несколько
    // (вместо name будет подставлен ключ из entry)
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js', '.json'], // если не пишем расширение модуля при подключении, пусть webpack ищет среди вот этих
    alias: { // шаблоны
      '@modules': path.resolve(__dirname, 'src/js/modules'),
      '@settings': path.resolve(__dirname, 'src/js/settings'),
    },
  },
  optimization: optimization(), // чтобы webpack не загружал скрипты одинаковых библиотек
  // несколько раз, если одна и та же библеотека подключена в нескольких файлах
  devServer: { // если установлен webpack-dev-server
    port: 4200,
    hot: isDev,
  },
  plugins: [
    new HTMLWebpackPluin({ // подключить бандлы и скрипты
      template: './index.html', // файл, на основании которого будет сформирован выходной
      // (из него нужно удалить <script>)
      minify: {
        collapseWhitespace: !isDev,
      },
    }),
    new CleanWebpackPlugin(), // очистка /dist перед каждой новой сборкой
    new CopyWebpackPlugin([ // перенос статических файлов
      {
        from: path.resolve(__dirname, 'src/favicon.ico'),
        to: path.resolve(__dirname, 'dist'),
      },
    ]),
    new MiniCssExtractPLugin({ // подключение стилей в отдельном файле
      filename: '[name].[contenthash].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/, // стили
        use: [MiniCssExtractPLugin.loader, 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/, // стили sass
        use: [MiniCssExtractPLugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|svg|gif)$/, // картинки
        use: ['file-loader'],
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/, // шрифты
        use: ['file-loader'],
      },
      {
        test: /\.js$/,
        exclude: '/node_modules/',
        loader: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-arrow-functions',
            ],
          },
        },
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        // для xml - xml-loader, csv - csv-loader
      },
    ],
  },
};
