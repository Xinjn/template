const glob = require('glob');
const path = require('path');
const fs = require('fs');
const shelljs = require('shelljs');
const _ = require('lodash');

module.exports = (env, useBuiltIns) => {
    let allpage = [];

    ['pc', 'mobile'].forEach((device) => {
        // 获取src下面的所有所有的config.js目录
        let pagePaths = glob.sync(
            path.join(process.cwd(), process.env.entryPath ? process.env.entryPath : `./src/${device}/**/config.js`),
        );

        for (const configjsPath of pagePaths) {
            if (!configjsPath.includes(`/src/${device}/`)) {
                continue;
            }
            // 根据路径 获取chunkName。例如：mobile_index, pc_user
            let trunkName = configjsPath.replace('/config.js', '').split('/src/').pop().replace(/\//g, '_');

            // 获取页面配置
            let page_config = require(configjsPath);
            // 如果页面没有path，则跳过
            if (!page_config?.path) {
                continue;
            }

            // 获取页面html文件路径:没有则使用根目录下template文件
            let htmlpath = configjsPath.replace('config.js', 'index.html');
            try {
                fs.statSync(htmlpath);
            } catch (error) {
                htmlpath = path.join(
                    process.cwd(),
                    // `./node_modules/@ifeng/fepacker/template/${device}.html`
                    `./template/${device}.html`,
                );
            }

            // 设置页面的pxtorem默认值， pc 为false， mobile 为 75
            page_config.pxtorem = page_config.pxtorem || (device === 'pc' ? false : 75);

            // 拼装页面的配置
            let config = {
                ...page_config,
                entry: {},
                device: device,
                trunkName: trunkName,
                action: 'default',
                htmlpath: process.env[trunkName] || htmlpath,
            };
            let edit_config = _.cloneDeep(config);
            let ssr_config = _.cloneDeep(config);

            if (env == 'development') {
                // 开发环境 - 设置普通模式配置  -- 开始
                let appjsPath = configjsPath.replace('/config.js', '/.app.jsx');
                // let appjsPath = configjsPath.replace('/config.js', '/app.jsx');
                config.action = 'default';
                config.appjsPath = appjsPath;
                config.entry[trunkName] = useBuiltIns == 'usage' ? appjsPath : ['core-js', appjsPath];
                allpage.push(config);
                shelljs.touch(appjsPath);
                // 开发环境 - 设置普通模式配置  -- 结束

                if (page_config.edit) {
                    // 开发环境 - 设置edit模式配置  -- 开始
                    let appjsPath = configjsPath.replace('/config.js', '/.edit.jsx');
                    edit_config.trunkName = trunkName + '_edit';
                    edit_config.action = 'edit';
                    edit_config.appjsPath = appjsPath;
                    edit_config.entry[trunkName + '_edit'] = appjsPath;

                    allpage.push(edit_config);
                    shelljs.touch(appjsPath);
                    // 开发环境 - 设置edit模式配置  -- 结束
                }

                if (page_config.ssr) {
                    // 开发环境 - 设置ssr模式配置  -- 开始
                    let appjsPath = configjsPath.replace('/config.js', '/.ssr.jsx');
                    ssr_config.trunkName = trunkName + '_ssr';
                    ssr_config.action = 'ssr';
                    ssr_config.appjsPath = appjsPath;
                    ssr_config.entry[trunkName + '_ssr'] = appjsPath;

                    allpage.push(ssr_config);
                    shelljs.touch(appjsPath);
                    // 开发环境 - 设置ssr模式配置  -- 结束
                }
            } else {
                // 测试和生产环境 - 设置普通模式配置  -- 开始
                let appjsPath = configjsPath.replace('/config.js', '/app.jsx');
                config.action = 'default';
                config.appjsPath = appjsPath;
                // config.entry[trunkName] = ["core-js", appjsPath];
                config.entry[trunkName] = useBuiltIns == 'usage' ? appjsPath : ['core-js', appjsPath];
                allpage.push(config);
                // 设置普通模式配置  -- 结束

                if (page_config.edit) {
                    // 测试和生产环境 - 设置edit模式配置  -- 开始
                    let appjsPath = configjsPath.replace('/config.js', '/app.jsx');

                    edit_config.trunkName = trunkName + '_edit';
                    edit_config.action = 'edit';
                    edit_config.appjsPath = appjsPath;
                    // edit_config.entry[trunkName + "_edit"] = ["core-js", appjsPath];
                    edit_config.entry[trunkName + '_edit'] = appjsPath;

                    allpage.push(edit_config);
                    // 测试和生产环境 - 设置edit页面配置  -- 结束
                }

                if (page_config.ssr) {
                    // 测试和生产环境 - 设置ssr模式配置  -- 开始
                    let appjsPath = configjsPath.replace('/config.js', '/app.jsx');
                    let ssrjsPath = configjsPath.replace('/config.js', '/.ssr.jsx');
                    let ssrFile = fs.readFileSync(appjsPath, 'utf-8');
                    ssrFile = ssrFile
                        .replace(/react-dom/, 'react-dom/server')
                        .replace('ReactDOM', '{ renderToNodeStream }')
                        .replace(/\/\*[\w\W]*?\*\//g, '')
                        .replace(
                            /ReactDOM.render.*/,
                            `const server = function server(allData) {
  return renderToNodeStream(<Layout content={allData} />);
};

export default server;`,
                        );
                    fs.writeFileSync(ssrjsPath, ssrFile, 'utf-8');

                    ssr_config.trunkName = trunkName + '_ssr';
                    ssr_config.action = 'ssr';
                    ssr_config.ssrjsPath = ssrjsPath;
                    ssr_config.entry[trunkName + '_ssr'] = ssrjsPath;

                    allpage.push(ssr_config);
                    // 测试和生产环境 - 设置ssr页面配置  -- 结束
                }
            }
        }
    });

    //   console.dir(all, { depth: null });

    return allpage;

    // allpage 结构demo
    //   [
    //     {
    //       path: '/pc/travel/TCAwardsIndex2021',
    //       allData: {
    //         pc: true,
    //         transferV3: [
    //           [ 'footer:底部公用版权', 'KVProxy', 'getStructuredFragment', 20036 ],
    //           [ 'Flow:颁奖流程', 'KVProxy', 'getStructuredFragment', 260098 ],
    //           [ 'Prize:获奖案例', 'KVProxy', 'getRecommendFragment', 285361 ],
    //           [ 'Prize2:获奖案例', 'KVProxy', 'getRecommendFragment', 285467 ],
    //           [ 'Talk:巅峰对话', 'KVProxy', 'getRecommendFragment', 285353 ],
    //           [ 'Talk2:巅峰对话', 'KVProxy', 'getRecommendFragment', 285468 ],
    //           [ 'Live:直播', 'KVProxy', 'getRecommendFragment', 285354 ],
    //           [ 'News:新闻动态', 'KVProxy', 'getRecommendFragment', 285355 ],
    //           [ 'Pics:图集', 'KVProxy', 'getRecommendFragment', 285356 ],
    //           [ 'Stars:明星助力', 'KVProxy', 'getRecommendFragment', 285357 ],
    //           [ 'Alerter:弹窗控制', 'KVProxy', 'getStructuredFragment', 260099 ],
    //           [ 'YZALShow:优质案例展示', 'KVProxy', 'getStaticFragments', 221215 ]
    //         ]
    //       },
    //       pxtorem: false,
    //       entry: {
    //         pc_index: '/Users/lirq1/work/ifeng_space/web-pages-custom-react/TCAwards2021/src/pc/index/.app.js'
    //       },
    //       device: 'pc',
    //       trunkName: 'pc_index',
    //       action: 'normal',
    //       appjsPath: '/Users/lirq1/work/ifeng_space/web-pages-custom-react/TCAwards2021/src/pc/index/.app.js'
    //     },
    //     {
    //       path: '/mobile/ishare/TCAwards2021',
    //       allData: {
    //         transferV3: [
    //           [ 'footer:底部公用版权', 'KVProxy', 'getStructuredFragment', 20036 ],
    //           [ 'Flow:颁奖流程', 'KVProxy', 'getStructuredFragment', 260098 ],
    //           [ 'Prize:获奖案例', 'KVProxy', 'getRecommendFragment', 285361 ],
    //           [ 'Prize2:获奖案例', 'KVProxy', 'getRecommendFragment', 285467 ],
    //           [ 'Talk:巅峰对话', 'KVProxy', 'getRecommendFragment', 285353 ],
    //           [ 'Talk2:巅峰对话', 'KVProxy', 'getRecommendFragment', 285468 ],
    //           [ 'Live:直播', 'KVProxy', 'getRecommendFragment', 285354 ],
    //           [ 'News:新闻动态', 'KVProxy', 'getRecommendFragment', 285355 ],
    //           [ 'Pics:图集', 'KVProxy', 'getRecommendFragment', 285356 ],
    //           [ 'Stars:明星助力', 'KVProxy', 'getRecommendFragment', 285357 ],
    //           [ 'Alerter:弹窗控制', 'KVProxy', 'getStructuredFragment', 260099 ],
    //           [ 'YZALShow:优质案例展示', 'KVProxy', 'getStaticFragments', 221215 ]
    //         ]
    //       },
    //       pxtorem: 75,
    //       entry: {
    //         mobile_index: '/Users/lirq1/work/ifeng_space/web-pages-custom-react/TCAwards2021/src/mobile/index/.app.js'
    //       },
    //       device: 'mobile',
    //       trunkName: 'mobile_index',
    //       action: 'normal',
    //       appjsPath: '/Users/lirq1/work/ifeng_space/web-pages-custom-react/TCAwards2021/src/mobile/index/.app.js'
    //     },
    //     {
    //       path: '/mobile/ishare/test',
    //       allData: {
    //         transferV3: [
    //           [ 'Flow:颁奖流程', 'KVProxy', 'getStructuredFragment', 260098 ],
    //           [ 'Prize:获奖案例', 'KVProxy', 'getRecommendFragment', 285361 ],
    //           [ 'Prize2:获奖案例', 'KVProxy', 'getRecommendFragment', 285467 ],
    //           [ 'Talk:巅峰对话', 'KVProxy', 'getRecommendFragment', 285353 ],
    //           [ 'Talk2:巅峰对话', 'KVProxy', 'getRecommendFragment', 285468 ],
    //           [ 'Live:直播', 'KVProxy', 'getRecommendFragment', 285354 ],
    //           [ 'News:新闻动态', 'KVProxy', 'getRecommendFragment', 285355 ],
    //           [ 'Pics:图集', 'KVProxy', 'getRecommendFragment', 285356 ],
    //           [ 'Stars:明星助力', 'KVProxy', 'getRecommendFragment', 285357 ],
    //           [ 'Alerter:弹窗控制', 'KVProxy', 'getStructuredFragment', 260099 ],
    //           [ 'YZALShow:优质案例展示', 'KVProxy', 'getStaticFragments', 221215 ]
    //         ]
    //       },
    //       pxtorem: 75,
    //       entry: {
    //         mobile_test: '/Users/lirq1/work/ifeng_space/web-pages-custom-react/TCAwards2021/src/mobile/test/.app.js'
    //       },
    //       device: 'mobile',
    //       trunkName: 'mobile_test',
    //       action: 'normal',
    //       appjsPath: '/Users/lirq1/work/ifeng_space/web-pages-custom-react/TCAwards2021/src/mobile/test/.app.js'
    //     }
    //   ]
};

// let data = module.exports("production");
// data = _.groupBy(data,(item)=>`${item.device}_${item.action}_${item.pxtorem}`);
// console.dir(data, { depth: null });
