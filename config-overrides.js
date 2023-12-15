const path = require("path");
const webpack = require("webpack");
const {
  override,
  //addLessLoader,
  addWebpackAlias,
  addBabelPlugin,
  addWebpackExternals,
} = require("customize-cra");
const addLessLoader = require("customize-cra-less-loader");

const overrideProcessEnv = (value) => (config) => {
  config.resolve.modules = [path.join(__dirname, "src")].concat(
    config.resolve.modules
  );
  return config;
};

const addWebpackAwait = () => (config) => {
  config.experiments = { ...config.experiments, topLevelAwait: true };
  config.resolve.fallback = {
    ...config.resolve.fallback,
    os: false,
    fs: false,
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    path: require.resolve("path-browserify"),
    stream: require.resolve("stream-browserify"),
    zlib: require.resolve("browserify-zlib"),
    assert: require.resolve("assert/"),
    crypto: require.resolve("crypto-browserify"),
  };
  config.plugins = [
    ...config.plugins,
    // fix "process is not defined" error:
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ];
  return config;
};

module.exports = override(
  /*
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: { "@primary-color": "#038fde" },
  }),
  */
  addLessLoader({
    lessLoaderOptions: {
      javascriptEnabled: true,
      lessOptions: {
        javascriptEnabled: true,
        modifyVars: {
          "@primary-color": "#038fde",
        },
      },
    },
  }),
  overrideProcessEnv({
    VERSION: JSON.stringify(require("./package.json").version),
  }),

  /*
  addWebpackAlias({
    ["o1js"]: path.resolve(__dirname, "node_modules/o1js"),
  }),
  */

  addWebpackAwait(),

  addBabelPlugin("@babel/plugin-syntax-top-level-await")
  /*
  addWebpackExternals({
    o1js: "o1js",
  })
  */
);

/*
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      o1js: require('path').resolve('node_modules/o1js'),
    };
    config.experiments = { ...config.experiments, topLevelAwait: true };
    config.optimization.minimizer = [];
    return config;
  },
*/
