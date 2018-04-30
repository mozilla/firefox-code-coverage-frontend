
const acceptedExternalEnvs = {
  ENABLE_CACHE: process.env.ENABLE_CACHE
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
        include: ['src', 'test'],
        eslint: {
          rules: {
            "no-console": "off",
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
            "https://fonts.googleapis.com/css?family=Fira+Sans:300,400",
            "https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.2/gh-fork-ribbon.min.css"
          ]
        },
        env: Object.keys(acceptedExternalEnvs)
      }
    ],
    '@neutrinojs/mocha',
    (neutrino) => {
      neutrino.config.when(process.env.NODE_ENV === 'production', config => {
        config.devtool('source-map');
      });
    }
  ]
};
