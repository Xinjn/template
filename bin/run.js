#!/usr/bin/env node

const fs = require('fs');
const yargs = require('yargs');
const shelljs = require('shelljs');
const path = require('path');
const { hideBin } = require('yargs/helpers');
const bodyParser = require('body-parser');
const qs = require('qs');
const argv = yargs(hideBin(process.argv)).argv;
const glob = require('glob');
const { getIp, getPort } = require('../services/tool');
const _ = require('lodash');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const stat = util.promisify(fs.stat);
const pathToRegexp = require('path-to-regexp');
const stealthyRequire = require('stealthy-require');
const request = require('../services/request');
const Request = require('request');
const { getIndexHTML } = require('./utils/getIndexHTML');
const { createProject } = require('./utils/createProject');
const ejs = require('ejs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const md5 = require('md5');
const { esbuild } = require('../esbuild.config.js');
const node_version = process.version;
const npm_version = shelljs.exec('npm -v', { silent: true }).stdout;

const sleep = async (timeout = 1000) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
};

/* 判断是否为readStream */
const isReadStream = function isReadStream(input) {
    return (
        typeof input === 'object' &&
        Object.prototype.toString.call(input) === '[object Object]' &&
        '_readableState' in input
    );
};

/* 读取stream流 */
const readStream = function readStream(stream) {
    const chunks = [];

    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        stream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });

        stream.on('error', (error) => {
            reject(error);
        });
    });
};

const addDevlopPolyfill = (html) => {
    return html.replace(
        /<\/head>/g,
        `<script>
  if (!String.prototype.endsWith) {
      String.prototype.endsWith = function(search, this_len) {
        if (this_len === undefined || this_len > this.length) {
          this_len = this.length;
        }
        return this.substring(this_len - search.length, this_len) === search;
      };
    }
</script>

</head>`,
    );
};

const getRouterList = async () => {
    let configFilePath = path.join(process.cwd(), './src/**/config.js');
    let filePaths = glob.sync(configFilePath);
    let routerList = [];
    for (const filepath of filePaths) {
        let trunkName = filepath.replace('/config.js', '').split('/src/').pop().replace(/\//g, '_');
        let config = stealthyRequire(require.cache, function () {
            return require(filepath);
        });
        let splitFilePath = path.resolve(filepath, '../config_split.js');
        let splitConfig = {};
        try {
            await stat(splitFilePath);
            splitConfig = stealthyRequire(require.cache, function () {
                return require(splitFilePath);
            });
        } catch (e) {
            // console.log(e);
        }
        let paths = typeof config.path == 'string' ? [config.path] : config.path;
        delete config.path;
        for (const _path of paths) {
            let paramNames = [];
            let routerReg = pathToRegexp(_path, paramNames);
            routerList.push({
                routerReg,
                paramNames,
                path: _path,
                ...config,
                splitConfig: {
                    ...splitConfig,
                },
                trunkName,
                appjsPath: filepath.replace('/config.js', '/app.jsx'),
                editjsPath: filepath.replace('/config.js', '/.edit.jsx'),
                ssrjsPath: filepath.replace('/config.js', '/.ssr.jsx'),
                handlerPath: filepath.replace(/\/src\/.*?\/config.js/, `/dist/${trunkName}_handler.js`),
            });
        }
    }
    return routerList;
};

//yargs:nodejs环境下的命令行参数解析工具
yargs
    .command('dev', 'dev', async (yargs) => {
        const Webpack = require('webpack');
        const WebpackDevServer = require('webpack-dev-server');
        const webpackConfig = require('../webpack.config.js');
        const compiler = Webpack(webpackConfig);

        // 从3000-4000之间找一个可用的端口
        let port = await getPort();
        let ip = await getIp();

        // 本地启动创建 dist目录
        shelljs.mkdir('-p', path.join(process.cwd(), './dist'));

        // 开发服务配置项
        const devServerOptions = {
            onBeforeSetupMiddleware: function (devServer) {
                let app = devServer.app;
                app.use(bodyParser.json());
                app.get('/', async function (req, res, next) {
                    let routerList = await getRouterList();

                    let pcList = [];
                    let mobileList = [];
                    for (const item of routerList) {
                        let url = `http://${ip}:${port}${item.path}`;

                        let editUrl = item.edit
                            ? `http://${ip}:${port}${item.path.replace(/\/$/, '')}/visualediting`
                            : '';
                        let ssrUrl = item.ssr ? `http://${ip}:${port}${item.path}?ssr=true` : '';
                        let __ui__Url = item.uiImg ? `http://${ip}:${port}${item.path.replace(/\/$/, '')}/__ui__` : '';
                        let a = `<a target="_blank" href="${url}">${url}</a>`;
                        let edit_a = item.edit ? `<a target="_blank" href="${editUrl}">可视化</a>` : '';
                        let ssr_a = item.ssr ? `<a target="_blank" href="${ssrUrl}">ssr</a>` : '';
                        let __ui__a = item.uiImg ? `<a target="_blank" href="${__ui__Url}">ui走查</a>` : '';
                        let split_a = `<a target="_blank" onclick='openSplit(\`${JSON.stringify(
                            item,
                        )}\`)' style="color: #008CBA">Split${
                            Object.keys(item.splitConfig).length === 0 ? '（未创建）' : ''
                        }</a>`;
                        if (item.trunkName.indexOf('pc_') == 0) {
                            pcList.push(
                                `<p>./src/${item.trunkName.replace(
                                    /_/g,
                                    '/',
                                )}: ${a} ${edit_a} ${ssr_a} ${__ui__a} ${split_a}</p>`,
                            );
                        }
                        if (item.trunkName.indexOf('mobile_') == 0) {
                            mobileList.push(
                                `<p>./src/${item.trunkName.replace(
                                    /_/g,
                                    '/',
                                )}:  ${a} ${edit_a} ${ssr_a} ${__ui__a} ${split_a}</p>`,
                            );
                        }
                    }
                    const html = await getIndexHTML({
                        node_version,
                        npm_version,
                        pcList: pcList.join('\n'),
                        mobileList: mobileList.join('\n'),
                    });
                    res.set('Content-Type', 'text/html');
                    res.send(html);
                });
                app.get('/create_pc', async function (req, res, next) {
                    console.log('创建pc页面');
                });
                app.get('/create_mobile', async function (req, res, next) {
                    console.log('创建mobile界面');
                });
                app.post('/splitUpdate', async function (req, res, next) {
                    const {
                        splitData: {
                            data: { dataMap: splitData, chipData, extraSetting },
                        },
                        customData,
                        isSplitEmpty,
                    } = req.body;
                    // 更新节点信息到config_split.js中，没有会直接创建
                    await writeFile(
                        path.resolve(customData.appjsPath, '../config_split.js'),
                        `module.exports = ${JSON.stringify(splitData)}`,
                    );
                    // 更新碎片信息到 config 中的 allData TODO 不影响注释
                    let configJs = await readFile(path.resolve(customData.appjsPath, '../config.js'), 'utf-8');
                    let configJsContent = new Function(`return ${configJs.replace(/module.exports\s*=/, '')}`)();
                    const AvailableChipType = ['getStaticFragment', 'getRecommendFragment', 'getStructureFragment'];
                    const ChipTypeMap = {
                        static: 'getStaticFragment',
                        recommend: 'getRecommendFragment',
                        struct: 'getStructureFragment',
                    };
                    const freezeChip = configJsContent.allData.transferV3
                        ? configJsContent.allData.transferV3.filter((c) => !AvailableChipType.includes(c[2]))
                        : [];
                    let newChip = [];
                    chipData.forEach((chip) => {
                        newChip.push([
                            `${chip.chipData.name}:${chip.chipData.title}`,
                            'KVProxy',
                            ChipTypeMap[chip.chipType],
                            chip.chipId,
                            {},
                        ]);
                    });
                    configJsContent.allData.transferV3 = [...freezeChip, ...newChip];
                    await writeFile(
                        path.resolve(customData.appjsPath, '../config.js'),
                        `module.exports = ${JSON.stringify(configJsContent, null, 2)}`,
                    );
                    await createProject(path.resolve(customData.appjsPath, '..'), splitData, chipData, extraSetting);
                    res.status(200).send('success');
                });
                // preview post接口直接代理到线上 channel容器中，本地不再链接redis
                app.post('*', async function (req, res, next) {
                    console.log('preview', req.path, req.method);
                    if (req.path.split('/').includes('preview')) {
                        const options = {
                            // target: `http://test0.web-feedflow-api.shank.ifeng.com/`,
                            target: `http://web-pages-channel.shank.ifeng.com`,
                            changeOrigin: true,
                        };
                        await createProxyMiddleware(options)(req, res, next);
                        return;
                    }
                    next();
                });
                app.get('*', async function (req, res, next) {
                    if (/\/.*?.html/.test(req.path)) {
                        let devAppPath = path.join(
                            process.cwd(),
                            './src',
                            req.path.replace(/_/g, '/').replace('.html', '/.app.jsx'),
                        );

                        if (req.path.includes('_edit')) {
                            devAppPath = path.join(
                                process.cwd(),
                                './src',
                                req.path.replace(/_/g, '/').replace('.html', '/.edit.jsx').replace('/edit/', '/'),
                            );
                        }
                        let _appfile = await readFile(devAppPath, 'utf-8');
                        if (_appfile.length == 0 || !_appfile.includes(`import `)) {
                            await writeFile(devAppPath, `import './app'`, 'utf-8');
                            // if(devAppPath.includes('/src/pc/')) {
                            //   await writeFile(devAppPath,`import './app'`,'utf-8');
                            // } else {
                            //   await writeFile(devAppPath,`import './app'`,'utf-8');
                            // }
                        }
                    }
                    // koa 路由代理到 webpack dev server
                    if (/^\/(pc|mobile)\//.test(req.path)) {
                        let ssr = req.query.ssr || false;
                        let _path = req.path;
                        let routerList = await getRouterList();

                        if (_path.split('/').includes('visualediting')) {
                            req.edit = true;
                            _path = _path.replace(/\/visualediting.*/, '');
                        }
                        if (_path.split('/').includes('preview')) {
                            req.preview = true;
                            req.uid = _path.match(/preview\/([\w-]+)/)[1];
                            _path = _path.replace(/\/preview.*/, '');
                        }
                        if (_path.split('/').includes('__ui__')) {
                            req.__ui__ = true;
                            _path = _path.replace(/\/__ui__/, '');
                        }

                        for (const router of routerList) {
                            let paramsArray = [];
                            let matches = router.routerReg.exec(_path);

                            if (matches && matches.length > 0) {
                                let params = {};
                                paramsArray = matches.slice(1);
                                for (var len = paramsArray.length, i = 0; i < len; i++) {
                                    if (router.paramNames[i]) {
                                        params[router.paramNames[i].name] = paramsArray[i];
                                    }
                                }

                                if (ssr && router.ssr) {
                                    let ssrFile = await readFile(router.ssrjsPath, 'utf-8');
                                    let appFile = await readFile(router.appjsPath, 'utf-8');
                                    if (ssrFile.length <= 10) {
                                        ssrFile = appFile
                                            .replace(/import/, "require('source-map-support').install();\nimport")
                                            .replace(/react-dom/, 'react-dom/server')
                                            .replace('ReactDOM', '{ renderToNodeStream }')
                                            .replace(/\/\*[\w\W]*?\*\//g, '')
                                            .replace(
                                                /ReactDOM.render.*/,
                                                `const server = function server(allData) {
                                  return renderToNodeStream(<Layout content={allData} />);
                                };
                                // export default server;`,
                                            );
                                        await writeFile(router.ssrjsPath, ssrFile, 'utf-8');
                                    }
                                }
                                let html = await request.get({
                                    url: `http://127.0.0.1:${port}/${router.trunkName}${req.edit ? '_edit' : ''}.html`,
                                    timeout: 30 * 1000,
                                });

                                let allDataConfig = router.allData || {};
                                let allData = {};
                                let adKeys = [];
                                if (router.handler == true) {
                                    await esbuild();
                                    await sleep(200);
                                    let code = await readFile(router.handlerPath, 'utf-8');
                                    console.log(code);
                                    let qs = { __action__: 'custom_react_handler', ...req.query };
                                    if (req.preview) {
                                        qs.preview = true;
                                        qs.uid = req.uid;
                                    }
                                    // let {response, body} = await request.post({url:`http://lirq1_3001.ifeng.com${_path}`, qs, json: {code, params}, response: true});
                                    let { response, body } = await request.post({
                                        url: `http://test0.ucms.ifeng.com/custompreview/${_path}`,
                                        qs,
                                        json: { code, params },
                                        response: true,
                                    });
                                    if (response.statusCode == 400) {
                                        return res.send(
                                            `<h4 style="color: red">handler.js发现错误</h4><p style="color: red">${body}</p>`,
                                        );
                                    }
                                    if (body && body.next === false) {
                                        return Request.post({
                                            url: `http://test0.ucms.ifeng.com/custompreview/${_path}`,
                                            qs,
                                            json: { code, params },
                                        }).pipe(res);
                                    }
                                    // console.dir(body, {depth: null})
                                    allData = body.allData;
                                    adKeys = _.isArray(body.adKeys) ? body.adKeys : [];
                                } else if (!_.isEmpty(allDataConfig)) {
                                    let qs = {};
                                    if (req.preview) {
                                        qs.preview = true;
                                        qs.uid = req.uid;
                                    }
                                    let data = await request.post({
                                        url: 'http://test0.web-feedflow-api.shank.ifeng.com/api/custom/dev/data',
                                        qs,
                                        json: allDataConfig,
                                    });
                                    // let data = await request.post({url:'http://lirq1_3001.ifeng.com/api/custom/dev/data', qs, json: allDataConfig})
                                    allData = data.allData;
                                    adKeys = data.adKeys;
                                }
                                for (const key in allData) {
                                    if (typeof allData[key] === 'string') {
                                        allData[key] = encodeURIComponent(allData[key]);
                                    }
                                }
                                if (router.path.includes(':')) {
                                    allData.params = params;
                                }
                                let ssrhtml = '';
                                if (ssr) {
                                    html = html.replace(
                                        /(<div[\w\W]*?id="root"[\w\W]*?\>)[\w\W]*?(<\/div>)/,
                                        '$1<%- body %>$2',
                                    );
                                    try {
                                        let ssrjs = '';
                                        let ssrjsmap = '';
                                        let ssrjsFilePath = '';
                                        for (let i = 0; i < 10; i++) {
                                            ssrjs = await request.get({
                                                url: `http://127.0.0.1:${port}/${router.trunkName}_ssr.js`,
                                            });
                                            ssrjsmap = await request.get({
                                                url: `http://127.0.0.1:${port}/${router.trunkName}_ssr.js.map`,
                                            });
                                            if (ssrjs.includes('createElement') || i >= 9) {
                                                let ssrjsHash = md5(ssrjs);
                                                ssrjsFilePath = path.join(process.cwd(), `./dist/${ssrjsHash}.js`);
                                                ssrjsmapFilePath = path.join(
                                                    process.cwd(),
                                                    `./dist/${router.trunkName}_ssr.js.map`,
                                                );
                                                // let ssrjsFilePath =  path.join(process.cwd(),`./dist/mobile_index_ssr.1e061c7553.js`)
                                                fs.writeFileSync(ssrjsmapFilePath, ssrjsmap, 'utf-8');
                                                fs.writeFileSync(ssrjsFilePath, ssrjs, 'utf-8');
                                                break;
                                            }
                                            await sleep(1000);
                                        }
                                        await sleep(200);
                                        const ssrServerModule = require(ssrjsFilePath);
                                        //  const ssrServerModule = eval(ssrjs);
                                        const ssrStreamOrString = await ssrServerModule.default(allData);
                                        // const ssrStreamOrString = await ssrServerModule.default(allData);
                                        ssrhtml = isReadStream(ssrStreamOrString)
                                            ? (await readStream(ssrStreamOrString)).toString()
                                            : ssrStreamOrString;
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }
                                let pcTongjiScript = '';
                                let mobileTongjiScript = '';
                                if (router.tongji) {
                                    let tongji = await request.get({
                                        url: 'http://test0.web-feedflow-api.shank.ifeng.com/api/custom/dev/tongji',
                                        json: true,
                                    });
                                    // let tongji = await request.get({url:'http://lirq1_3001.ifeng.com/api/custom/dev/tongji',json: true})
                                    pcTongjiScript = tongji.pcTongjiScript;
                                    mobileTongjiScript = tongji.mobileTongjiScript;
                                }

                                html = addDevlopPolyfill(html);
                                html = ejs.render(html, {
                                    allData,
                                    adKeys,
                                    body: ssrhtml,
                                    bid: 'test',
                                    pcTongjiScript: pcTongjiScript,
                                    mobileTongjiScript: mobileTongjiScript,
                                    router: router.path,
                                    __ui__: Boolean(req.__ui__ && !_.isEmpty(router.uiImg)),
                                    uiImg: JSON.stringify(_.isArray(router.uiImg) ? router.uiImg : [router.uiImg]),
                                });
                                res.send(html);
                            }
                        }
                    }
                    next();
                });
            },
            // onAfterSetupMiddleware: function (devServer) {
            //   if (!devServer) {
            //     throw new Error('webpack-dev-server is not defined');
            //   }
            //   devServer.app.get('*', function (req, res, next) {
            //     console.log('=',res.get('Content-Type'))
            //     next()
            //     console.log(res.get('Content-Type'))
            //   });
            // },
            client: {
                webSocketTransport: 'sockjs',
            },
            webSocketServer: 'sockjs',
            hot: true,
            liveReload: true,
            allowedHosts: 'all',
            compress: false,
            port,
            open: true,
        };

        // 本地服务
        const server = new WebpackDevServer(devServerOptions, compiler);

        const runServer = async () => {
            console.log('Starting server...');
            await server.start();
        };
        runServer();
    })

    .command('build', 'build', (yargs) => {
        try {
            let { code } = shelljs.exec(`webpack --config ${path.join(__dirname, '../webpack.config.js')}`);
            process.exit(code);
        } catch (error) {
            process.exit(1);
        }
    })

    .command('esbuild', 'show config', (yargs) => {
        esbuild();
    })

    .command('lint', 'show config', (yargs) => {})

    .help().argv;
