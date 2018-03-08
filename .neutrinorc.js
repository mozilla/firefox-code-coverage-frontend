module.exports = {
  use: [
    [
      '@neutrinojs/airbnb',
      {
        eslint: {
          rules: {
            "comma-dangle": "off",
            "indent": "off",
            "no-console": "off",
            "no-undef": "off",
            "no-underscore-dangle": "off",
            "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
            "react/prop-types": "off",
          }
        }
      }
    ],
    [
      '@neutrinojs/react',
      {
        html: {
          title: 'Firefox code coverage diff viewer',
          links: [
            "https://fonts.googleapis.com/css?family=Fira+Sans:300,400"
          ]
        }
      }
    ],
    (neutrino) => {
      neutrino.config.when(process.env.NODE_ENV === 'production', config => {
        config.devtool('source-map');
      });
    }
  ]
};
