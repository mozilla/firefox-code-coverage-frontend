module.exports = {
  use: [
    ['neutrino-preset-mozilla-rpweb', {
      eslint: {
        rules: {
          'consistent-return': 'off',
          'no-unused-expressions': 'off',
          'no-shadow': 'off',
          'no-return-assign': 'off',
          'babel/new-cap': 'off',
          'no-mixed-operators': 'off',
          'array-callback-return': 'off'
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
