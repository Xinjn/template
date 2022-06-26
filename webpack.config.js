const path = require('path');
const del = require('del');
const _ = require('lodash');
const webpack = require('webpack');

// 清除开发用的所有临时文件 .app.jsx / .edit.jsx / .ssr.jsx
del.sync([`${path.join(process.cwd(), './src/**/.(app|edit|ssr).jsx')}`, `${path.join(process.cwd(), './dist')}`]);

const genericNames = require('generic-names');
const generate = genericNames('[name]_[local]_[hash:base64:5]', {
    context: process.cwd(),
});
const getLocalIdent = (loaderContext, localIdentName, localName) => generate(localName, loaderContext.resourcePath);

// 生成Html插件
const HtmlWebpackPlugin = require('html-webpack-plugin');

// px2rem 库
// const adaptive = require('@ifengbuild/postcss-adaptive-extra');
const adaptive = require('postcss-adaptive-extra');
const postImport = require('postcss-import');
const nextcss = require('postcss-cssnext');
const postExtend = require('postcss-extend');
const postMixin = require('postcss-mixins');
// 打包css文件
const MiniCssExtractPlugin = require('mini-css-extract-plugin').default;

const TerserPlugin = require('terser-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CrossoriginWebpackPlugin = require('crossorigin-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// 绝对路径
const basePath = process.cwd();
// 获取package：项目name 和 自定义接口接口
const {
    name,
    webpack: { definePlugin, hbsDir = [] },
} = (package_json = require(path.join(basePath, './package.json')));

// 重要!! 后端注入
process.env.NODE_ENV = 'development';

// 声明开发环境
const env = process.env.NODE_ENV || 'development';
const isProd = process.env.NODE_ENV == 'production';
const isDev = process.env.NODE_ENV == 'development';
console.log('isDev', isDev);
const { esbuild } = require('./esbuild.config');

let apiBase = definePlugin[env];
for (const key in apiBase) {
    apiBase[key] = JSON.stringify(apiBase[key]);
}
console.log('basePath:', basePath);
// PC/mobile配置数据
let getGroup = require('./services/getGroup');
let group = getGroup(env);

// 测试环境和生产环境，打包必须注入 CI_BUILD_REF_NAME 和 GITLAB_USER_LOGIN 两个环境变量
// if (!isDev && !process.env.hasOwnProperty('publicPath')) {
//     if (!process.env.CI_BUILD_REF_NAME) {
//         console.error('请注入环境变量：CI_BUILD_REF_NAME');
//         process.exit(1);
//     }
//     if (!process.env.GITLAB_USER_LOGIN) {
//         console.error('请注入环境变量：GITLAB_USER_LOGIN');
//         process.exit(1);
//     }
// }

// 在cdn地址-添加分支信息
let branch = '';
if (env === 'staging' && !process.env.hasOwnProperty('publicPath')) {
    branch = `~${process.env.CI_BUILD_REF_NAME}~/`;
} else if (env === 'production' && !process.env.hasOwnProperty('publicPath')) {
    if (process.env.CI_BUILD_REF_NAME.indexOf('test_prod') == 0) {
        branch = `~${process.env.CI_BUILD_REF_NAME}~/`;
    }
}
// 项目启动时 执行一次esbuild，编译handler.js代码
esbuild();

module.exports = group.map((item) => {
    let {
        device,
        action,
        pxtorem,
        entrys,
        htmlPlugins, //注意：filename声明html文件名必须和template字段下文件名一致
        useBuiltIns,
        modules,
    } = item;
    // 碎片
    let isEdit = action === 'edit';
    console.log('---------------------');
    console.log('item', item);
    console.log('htmlPlugins', item['htmlPlugins']);
    console.log('userOptions', item['htmlPlugins'][0]['userOptions']);
    console.log('---------------------');
    return {
        // 禁用/启用缓存：cache 默认是写到 内存中的，写到文件会加快二次启动，如果要关闭 缓存，请设置 cache: false
        cache: {
            type: 'filesystem',
            allowCollectingMemory: true,
            cacheDirectory: path.resolve(process.cwd(), `node_modules/.cache/webpack/${device}_${action}_${pxtorem}`),
        },
        // 包(bundle)应该运行的环境
        target: action != 'ssr' ? ['web', 'es5'] : 'node',
        // 当前环境
        mode: isDev ? 'development' : 'production',
        // node是一个对象，其中每个属性都是 Node.js 全局变量或模块的名称
        node: {
            __filename: true,
            __dirname: true,
        },
        // 入口
        entry: entrys,
        // 输出
        // 输出文件

        output: _.pickBy(
            {
                path: path.resolve(basePath, 'dist'),
                filename: isDev ? '[name].js' : '[name].[chunkhash:10].js',
                chunkFilename: isDev ? '[name].js' : '[name].[chunkhash:10].js',
                // clean: true,
                publicPath: process.env.hasOwnProperty('publicPath')
                    ? process.env.publicPath
                    : isDev
                    ? '/'
                    : `https://x2.ifengimg.com/fe/custom/${name}/${branch}`,
                libraryTarget: action == 'ssr' ? 'umd' : undefined,
            },
            _.identity,
        ),
        devtool: isDev ? 'cheap-module-source-map' : 'source-map',
        // 自动补全后缀名
        resolve: {
            symlinks: false,
            extensions: ['.js', '.jsx', '.json'],
            modules: [
                'node_modules',
                path.resolve(process.cwd(), './node_modules'),
                path.resolve(process.cwd(), './node_modules/@ifeng/fepacker/node_modules'),
            ],
            // 必填：指定路径别名
            alias: {
                '@src': path.resolve(basePath, './src'),
                '@': path.resolve(basePath),
                Chip: !isEdit
                    ? '@ifeng/visualediting/src/components/ChipView'
                    : '@ifeng/visualediting/src/components/Chip',
                // 可视化编辑组件，在展示模式下，只需要加载一个空组件，这样可以将可视化的业务代码放在内网。
                ChipEdit: !isEdit
                    ? '@ifeng/visualediting/src/components/ChipEditView'
                    : '@ifeng/visualediting/src/components/ChipEdit',
                // 数据转换组件。
                chipDataTransform: !isEdit
                    ? '@ifeng/web-server/src/common/transformView.js'
                    : '@ifeng/web-server/src/common/transform.js',
                ThreeTerminal_base: '@ifeng/three_terminal/es/base',
                ThreeTerminal_mobile: '@ifeng/three_terminal/es/mobile',
                ThreeTerminal_pc: '@ifeng/three_terminal/es/pc',
                ThreeTerminal_mobile_dynamic: '@ifeng/three_terminal/es/mobile/dynamic',
                ThreeTerminal_pc_dynamic: '@ifeng/three_terminal/es/pc/dynamic',
                ThreeTerminal_utils: '@ifeng/three_terminal/es/utils',
            },
        },
        module: {
            rules: [
                // js/jsx
                {
                    test: /\.js|jsx$/, // 匹配js文件
                    // 指定
                    include: [
                        path.resolve(basePath, 'node_modules/@ifeng'),
                        path.resolve(basePath, 'node_modules/.pnpm/@ifeng'),
                        path.resolve(basePath, 'src'),
                    ],
                    // 排除
                    exclude: /node_modules/,
                    use: {
                        // babel编译:es6语法
                        loader: require.resolve('babel-loader'),
                        options: {
                            cacheDirectory: true,
                            presets: [
                                [
                                    '@babel/preset-env',
                                    action == 'ssr'
                                        ? {
                                              targets: { node: 12 },
                                              modules: 'commonjs',
                                          }
                                        : {
                                              corejs: {
                                                  version: '3',
                                                  proposals: true,
                                              },
                                              targets: {
                                                  browsers: [
                                                      'edge >= 16',
                                                      'safari >= 9',
                                                      'firefox >= 57',
                                                      'ie >= 9',
                                                      'ios >= 9',
                                                      'chrome >= 49',
                                                  ],
                                              },
                                              loose: false,
                                              modules,
                                              // modules: "commonjs", // "amd" | "umd" | "systemjs" | "commonjs" | "cjs" | "auto" | false, 默认为"auto".
                                              // modules: false,
                                              // useBuiltIns: "entry",
                                              // useBuiltIns: "usage",
                                              useBuiltIns,

                                              debug: false,
                                          },
                                ],
                                '@babel/preset-react',
                            ],
                            plugins: [
                                // isDevelopment && require.resolve('react-refresh/babel'),
                                // ["@babel/plugin-transform-runtime", { corejs: false }],
                                [
                                    '@babel/plugin-transform-runtime',
                                    action == 'ssr' || useBuiltIns == 'entry' ? { corejs: false } : { corejs: 3 },
                                ],
                                '@babel/plugin-syntax-dynamic-import',
                                '@babel/plugin-syntax-import-meta',
                                [
                                    '@babel/plugin-proposal-decorators',
                                    {
                                        legacy: true,
                                    },
                                ],
                                '@babel/plugin-proposal-class-properties',
                                '@babel/plugin-proposal-json-strings',
                                '@babel/plugin-proposal-function-sent',
                                '@babel/plugin-proposal-export-namespace-from',
                                '@babel/plugin-proposal-numeric-separator',
                                '@babel/plugin-proposal-throw-expressions',
                                '@babel/plugin-transform-async-to-generator',
                            ].filter(Boolean),
                        },
                    },
                },

                // css
                {
                    test: /\.css$/,
                    include: [
                        path.resolve(basePath, 'node_modules/@ifeng'),
                        path.resolve(basePath, 'node_modules/.pnpm/@ifeng'),
                        path.resolve(basePath, `./src`),
                    ],
                    use: [
                        action != 'ssr' && (isDev ? require.resolve('style-loader') : MiniCssExtractPlugin.loader),
                        {
                            loader: require.resolve(`css-loader`),
                            options: {
                                // 重要！：css中url不对，需要开启下两个属性
                                // url: true,
                                esModule: false,
                                importLoaders: 2,
                                modules: _.pickBy(
                                    {
                                        // localIdentName: isDev? '[path][name]_[local]' : '[local]-[hash:base64:8]',
                                        localIdentName: isDev && '[path][name]_[local]',
                                        getLocalIdent: !isDev && getLocalIdent,
                                        exportOnlyLocals: action == 'ssr',
                                    },
                                    _.identity,
                                ),
                            },
                        },
                        {
                            loader: require.resolve('postcss-loader'),
                            options: {
                                sourceMap: true,

                                postcssOptions: {
                                    parser: 'postcss-scss',
                                    sourceMap: true,
                                    plugins: [
                                        postImport({
                                            resolve: function (id, basedir) {
                                                const config = {
                                                    '@src': process.cwd(),
                                                };
                                                for (let item of Object.keys(config)) {
                                                    if (new RegExp(item).test(id)) {
                                                        return path.resolve(config[item], id.replace('@', ''));
                                                    }
                                                }
                                                return path.resolve(basedir, id);
                                            },
                                        }),

                                        postExtend(),
                                        postMixin(),

                                        nextcss({
                                            // browsers: ["last 2 versions",  "ie >= 9"],
                                            browsers: [
                                                'last 2 versions',
                                                device == 'pc' && 'ie >= 9',
                                                'IOS >= 8',
                                                'android>= 4',
                                            ].filter(Boolean),
                                        }),

                                        pxtorem &&
                                            adaptive({
                                                remUnit: pxtorem,
                                                autoRem: true,
                                                useCssModules: true,
                                            }),
                                    ].filter(Boolean),
                                },
                            },
                        },
                    ].filter(Boolean),
                },

                // 其他css配置
                {
                    test: /\.css$/,
                    exclude: [
                        path.resolve(basePath, 'node_modules/@ifeng'),
                        path.resolve(basePath, 'node_modules/.pnpm/@ifeng'),
                    ],
                    include: [path.resolve(basePath, 'node_modules')],
                    use: [
                        action != 'ssr' && (isDev ? require.resolve('style-loader') : MiniCssExtractPlugin.loader),
                        require.resolve('css-loader'),
                    ].filter(Boolean),
                },

                // handlebars模版
                {
                    test: /(\.html$)|(\.ejs$)|(\.handlebars$)|(\.hbs)/,
                    loader: require.resolve('handlebars-loader'),
                    options: {
                        partialDirs: [
                            path.join(__dirname, './template/hbstmp'),
                            ...hbsDir.map((item) => path.join(basePath, item)),
                        ].filter(Boolean),
                    },
                },

                // 加载json文件
                {
                    test: /\.json$/,
                    use: ['json-loader'],
                    type: 'javascript/auto',
                },

                // 文件
                {
                    test: /\.(eot|woff|woff2|ttf|svg|png|jpg|jpeg|gif)$/,
                    use: [
                        {
                            loader: require.resolve('url-loader'),
                            options: {
                                limit: 100,
                                name: '[name].[hash:8].[ext]',
                                esModule: false,
                            },
                        },
                    ],
                },
                {
                    test: /\.md$/,
                    use: 'raw-loader',
                },
            ],
        },
        plugins: [
            isDev && new CaseSensitivePathsPlugin({}),
            new webpack.DefinePlugin({
                ...apiBase,
            }),
            // html启动服务
            ...htmlPlugins,

            !isDev &&
                new MiniCssExtractPlugin({
                    filename: '[name].[contenthash:10].css',
                    chunkFilename: '[id].[contenthash:10].css',
                }),

            !isDev && new CrossoriginWebpackPlugin(),
        ].filter(Boolean),
        optimization: isDev
            ? {}
            : action == 'ssr'
            ? {
                  usedExports: true,
                  minimize: true,
                  minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
              }
            : {
                  // 提取公共代码
                  splitChunks: {
                      cacheGroups: {
                          // 抽離 node_modules
                          chunks: 'async',
                          vendors: {
                              test: /[\\/]node_modules[\\/]react/,
                              chunks: 'initial',
                              name: 'dll',
                              priority: 20,
                              enforce: true,
                          },
                      },
                  },

                  usedExports: true,
                  minimize: true,
                  minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
              },
    };
});

console.error('加载webpack.config');
