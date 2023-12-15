const path = require("path");
const {
  override,
  addLessLoader,
  addWebpackAlias,
  addBabelPlugin,
  addWebpackExternals,
} = require("customize-cra");

const overrideProcessEnv = (value) => (config) => {
  config.resolve.modules = [path.join(__dirname, "src")].concat(
    config.resolve.modules
  );
  return config;
};

module.exports = override(
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: { "@primary-color": "#038fde" },
  }),
  overrideProcessEnv({
    VERSION: JSON.stringify(require("./package.json").version),
  }),
  addWebpackAlias({
    ["o1js"]: path.resolve(__dirname, "node_modules/o1js"),
  }),
  addBabelPlugin("@babel/plugin-syntax-top-level-await"),
  addWebpackExternals({
    o1js: "o1js",
  })
);

/*
  webpack: function (config, env) {
    config.resolve.alias = {
      ...config.resolve.alias,
      o1js: require("path").resolve("node_modules/o1js"),
    };
    config = { ...config, topLevelAwait: true };
    config.optimization.minimizer = [];
    return config;
  },
  */
