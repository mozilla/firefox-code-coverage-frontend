module.exports = {
  use: [
    ['neutrino-preset-mozilla-rpweb', {
      eslint: {
        rules: {
          'array-callback-return': 'off',
          'consistent-return': 'off'
        }
      },
      react: {
        html: {
          title: 'Firefox code coverage diff viewer'
        }
      }
    }]
  ]
}
