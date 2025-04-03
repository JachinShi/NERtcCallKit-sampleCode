const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
       'nertc-web-sdk': path.resolve(__dirname, 'node_modules/nertc-web-sdk'),
      },
    },
  }
}

module.exports = {
    devServer: {
        client: {
            overlay: false
        }
    }
}