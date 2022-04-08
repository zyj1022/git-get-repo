const replace = require('@rollup/plugin-replace');

module.exports = {
  rollup(config, options) {
    config.plugins.push(replace({
      preventAssignment: false
    }))
    return config;
  },
};