const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportWidth: 1920,
  viewportHeight: 1080,
  chromeWebSecurity: false,
  e2e: {
    
    setupNodeEvents (on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
    },
    video: true,
    reporter: 'cypress-mochawesome-reporter',
  },

})
