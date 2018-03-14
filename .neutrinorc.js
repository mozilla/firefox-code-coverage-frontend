const acceptedExternalEnvs = {
  ROUTING: 'ROUTING' in process.env ? process.env.ROUTING : 'browserHistory',
};

// Set environment variables to their default values if not defined
Object
  .keys(acceptedExternalEnvs)
.forEach(env => !(env in process.env) && (process.env[env] = acceptedExternalEnvs[env]));

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
        },
        env: Object.keys(acceptedExternalEnvs),
      }
    ],
    (neutrino) => {
      // Read https://stackoverflow.com/a/36623117
      // This is the key to making React Router work with browserHistory
      neutrino.config.output.publicPath('/');
      neutrino.config.when(process.env.NODE_ENV === 'production', config => {
        config.devtool('source-map');
      });
    }
  ]
};
