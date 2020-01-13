/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '6210364d346367b6bd0d85f611bfb0df';

  // add your middleware config here
  config.middleware = [];

  config.mysql = {
    client: {
      host: '129.211.122.221',
      port: '3306',
      user: 'rfid-repo',
      password: 'rfid-repo',
      database: 'rfid'
    },
    app: true,
    agent: false
  }

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    AppID: 'wx2f4db5dd499270e9',
    AppSecret: '6210364d346367b6bd0d85f611bfb0df',
  };

  return {
    ...config,
    ...userConfig,
  };
};
