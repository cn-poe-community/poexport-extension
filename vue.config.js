const getCharacters = require('./mock/getCharacters.json')

module.exports = {
  productionSourceMap: false,
  filenameHashing: false,
  pages: {
    index: { entry: 'src/main.js' },
    export: { entry: 'src/export.js' }
  },
  devServer: {
    before: function (app, server) {
      app.post("/character-window/get-characters", function (req, res) {
        res.json(getCharacters)
      })
    }
  },
  chainWebpack: config => {
    config
      .entry('trade')
        .add('./src/js/trade.js')
  }
}