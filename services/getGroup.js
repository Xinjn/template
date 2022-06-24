const _ = require('lodash');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const getAllpages = require('./getAllPages');
const isDev = process.env.NODE_ENV == 'development';
const package_json = require(path.join(process.cwd(), './package.json'));
package_json.namespace = package_json.namespace || 'custom';
package_json.appname = package_json.appname || package_json.name || '';
const useBuiltIns = package_json.webpack.useBuiltIns == 'usage' ? 'usage' : 'entry';
const modules = typeof package_json.webpack.modules == 'undefined' ? 'commonjs' : package_json.webpack.modules;

module.exports = (env) => {
    // 设置pc/mobile路径及配置
    let allPages = getAllpages(env, useBuiltIns);

    let pageGroup = _.groupBy(allPages, (item) => `${item.device}_${item.action}_${item.pxtorem}`);

    let group = [];

    for (const key in pageGroup) {
        let { device, action, pxtorem, htmlpath } = pageGroup[key][0];
        let entrys = {};
        let htmlPlugins = [];

        for (const item of pageGroup[key]) {
            // 生成entry
            entrys = { ...entrys, ...item.entry };

            if (action == 'ssr') {
                continue;
            }
            // 生成htmlPlugin
            htmlPlugins = [
                ...htmlPlugins,
                new HtmlWebpackPlugin({
                    template: item.htmlpath,
                    chunks: [item.trunkName],
                    filename: env == 'development' ? `${item.trunkName}.html` : `${item.trunkName}.[contenthash].html`,
                    inject: 'body',
                    config: {
                        isDev,
                        isMobile: device == 'mobile',
                        isEdit: action == 'edit',
                        package_json,
                        device,
                        action,
                        isPxtorem: !!pxtorem,
                        tongji: item.tongji,
                    },
                }),
            ];
        }
        group.push({
            device,
            action,
            pxtorem,
            entrys,
            htmlPlugins,
            useBuiltIns: useBuiltIns,
            modules: modules,
        });
    }

    return group;
};
