const path = require('path');

module.exports = {
  outputDir: path.resolve(__dirname, '../settings'),
  publicPath: './',
  transpileDependencies: [
    'vuetify'
  ],
  css: {
    loaderOptions: {
        sass: {
            additionalData: '@import "@/styles/main.scss"'
        }
    }
  }
};
