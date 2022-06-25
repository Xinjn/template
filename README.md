## 文档说明

### 环境说明

支持 node14.\*，其他版本未测试

支持 npm ，yarn， pnpm 安装依赖（pnpm 需要在 .npmrc 中配置 shamefully-hoist=true ）

### 如何上线

通过 gitlab cicd 编译后上线，如果上线后发现问题，请去[网站开发管理平台](https://ucms.ifeng.com/platform/shankconf)回退本次上线

> 测试环境-上线： test 分支 push 代码后自动打包上线

> 生产环境-上线： 创建 tag 后自动打包上线（tag 格式：v\d.\d\d.\d\d，例：v1.00.01）

### 多分支上线

> 测试环境-多分支-上线：test_xxx 分支，push 代码后自动打包上线（不包含 test_prod_xxx 分支）

> 生产环境-多分支-上线：test_prod_xxx 分支，push 代码后自动打包上线

如何访问多分支？请在路由后面添加分支名（ /~分支名~ ）访问，分支名可以在 path 的任意位置

> 测试环境-示例：http://test.news.ifeng.com/loc/timeline/~test_xxx~ 或 http://test.news.ifeng.com/loc/~test_xxx~/timeline 或 http://test.news.ifeng.com/~test_xxx~/loc/timeline

> 生产环境-示例：https://news.ifeng.com/loc/timeline/~test_prod_xxx~ 或 https://news.ifeng.com/loc/~test_prod_xxx~/timeline 或 https://news.ifeng.com/~test_prod_xxx~/loc/timeline

### 测试环境如何测试

测试环境域名一般需要在 domain 前面加一个 test.

例：path：/mobile/ishare/loc/timeline 测试链接：http://test.ishare.ifeng.com/loc/timeline 生产链接：https://ishare.ifeng.com/loc/timeline

##### 本地测试：

-   需要绑 host：10.66.221.4， 例如： 10.66.221.4 test.ishare.ifeng.com

##### 手机测试：

-   可以通过 nohost 代理的方式，在[nohost](http://172.30.21.18:8181/admin.html)中进行 host 绑定，

-   可以将 host 设置在[测试 dns](https://git.ifengidc.com/whale/shankhost)上（添加 host 之后，自动生效），手机连上内网 wifi 后，手动设置一下 wifi 的 dns：172.30.188.32（设置时请删除 wifi 上默认的 dns）

-   使用 dd6 的 wifi，默认已经配置了上面的 dns，连上就可以测试

特别提醒，测试链接不支持 https

### 上线缓存

生产环境：上线之后，一般需要 1-3 分钟才能生效 (cdn 缓存 2 分钟，旧页面还会在项目中缓存 1 分钟)

测试环境：上线之后，一般需要 1 分钟才能生效

### webpack：别名

@: 代表根目录，例如：@/src/mobile/utils/util.js

@src: 代表 src 目录，例如：@src/mobile/utils/util.js

Chip: !isEdit? "@ifeng/visualediting/src/components/ChipView": "@ifeng/visualediting/src/components/Chip"

ChipEdit: !isEdit? "@ifeng/visualediting/src/components/ChipEditView": "@ifeng/visualediting/src/components/ChipEdit" // 可视化编辑组件，在展示模式下，只需要加载一个空组件，这样可以将可视化的业务代码放在内网。

chipDataTransform: !isEdit? "@ifeng/web-server/src/common/transformView.js": "@ifeng/web-server/src/common/transform.js" // 数据转换组件。

ThreeTerminal_base: "@ifeng/three_terminal/es/base" // 即将废弃

ThreeTerminal_mobile: "@ifeng/three_terminal/es/mobile" // 即将废弃

ThreeTerminal_pc: "@ifeng/three_terminal/es/pc" // 即将废弃

ThreeTerminal_mobile_dynamic: "@ifeng/three_terminal/es/mobile/dynamic" // 即将废弃

ThreeTerminal_pc_dynamic: "@ifeng/three_terminal/es/pc/dynamic" // 即将废弃

### 如何使用可视化

1. 安装以下依赖：  
   @ifeng/visualediting  
   @ifeng/ui_base  
   @ifeng/web-server
2. 在 layout/index.jsx 引入：

```
import Chip from 'Chip';
import ChipEdit from 'ChipEdit';
import chipDataTransform from 'chipDataTransform';
```

然后在 render() 或者 return 语句里加入
`<ChipEdit transform={chipDataTransform} />`，可以放在任意位置，一般放在根部 div 的末尾。 3. 在 config.js 的 allData 中填写获取碎片信息的 kvJSON，可以使用 [allData 生成工具](http://sys-manager.shank.ifeng.com/utils/kvtool/) 来帮助完成这件事，获取的数据会注入到 layout/index.jsx 中的 props.content 里 4. 因为 layout/index.jsx 是根组件，所以可以在任意位置使用`<Chip>`组件了，组件属性：

| 属性名    | 是否必须 | 数据类型        | 参数说明                                                                                                   |
| --------- | -------- | --------------- | ---------------------------------------------------------------------------------------------------------- |
| id        | 是       | String          | 碎片 id                                                                                                    |
| type      | 是       | String          | 碎片类型，'static'、'recommend'、'struct'等等                                                              |
| name      | 是       | String          | 碎片在 allData 中的 key 名，需要保证唯一                                                                   |
| title     | 是       | String          | 碎片的描述，可以是中文                                                                                     |
| groupName | 是       | String          | 碎片分组，groupName 相同的碎片会分在同一个组里                                                             |
| key       | 否       | String          | 碎片的 name，没有测试不填的后果，猜测是为了 React 更新数据时不会错乱，保证碎片数据正确，建议加上           |
| content   | 否       | Object 或 Array | 碎片的数据，应该填写：this.props.content\[碎片 name]，该属性会被<Chip>内的 Children 组件继承，看下面的例子 |

```jsx
/**
 * ChipMap是一个放置碎片数据的Object，包含id、name、type、title、groupName等必填项，放在一起方便管理碎片数据
 * content['Banner1'] 就是碎片的数据，这个content会传递给子组件<Banner>中，直接在Banner中使用 this.props.content 即可，可以与Banner的其他props共存
 *
 * */
<Chip key="Banner1" {...ChipMap.Banner1} content={content['Banner1']}>
    <Banner />
</Chip>
```

### 在 package.json 中 配置接口 basePath，例如

    "webpack": {
        "definePlugin": {
            "development": {
                "NODE_ENV": "development",
                "apiUrl": "/api",
                "ChipUrl": "https://ucms.ifeng.com/shard",
                "FullPagePreviewUrl": ""
            },
            "staging": {
                "NODE_ENV": "staging",
                "apiUrl": "//test.shankapi.ifeng.com/season",
                "ChipUrl": "https://ucms.ifeng.com/shard",
                "FullPagePreviewUrl": ""
            },
            "production": {
                "NODE_ENV": "production",
                "apiUrl": "//shankapi.ifeng.com/season",
                "ChipUrl": "https://ucms.ifeng.com/shard",
                "FullPagePreviewUrl": ""
            }
        }
    }

### 标准项目目录结构

```
|-- src
|   |-- pc                  // 存放pc页面
|       |-- index           // 页面文件夹
|           |-- layout      // 布局目录
|           |-- app.jsx     // 前端代码入口文件
|           |-- index.html  // 前端页面html文件
|           |-- config.js   // 页面配置文件，包含：path，pxtorem ，可视化，ssr，allData等配置
|           |-- .app.jsx    // 本地开发-自动生成的临时文件 （请忽略）
|           |-- .edit.jsx   // 本地开发-自动生成的临时文件 （请忽略）
|           |-- .ssr.jsx    // 本地开发-自动生成的临时文件 （请忽略）
|   |-- mobile              // 存放mobile页面
|       |-- index
|           |-- layout
|           |-- app.jsx
|           |-- index.html
|           |-- config.js
|
|-- .eslintignore
|-- .eslintrc.js
|-- .jsconfig.json          // 配置 vscode 的 @src 和 @ 指向
|-- .gitignore
|-- .gitlab-ci.yml          // gitlab cicd执行文件
|-- .npmrc
|-- package.json
|-- package-lock.json
```

### config.js

一个 config.js 代表一个页面，config.js 最少需要包含一个 path，config.js 需要跟 app.jsx 在同一目录

    module.exports = {
        path: "/mobile/news/timeline/:id",
        edit: false,
        ssr: false,
        pxtorem: 75,
        cdncache: 120,
        online: true,
        tongji: false,
        uiImg: '',
        allData: {},
        handler: false,
    };

#### config.js 参数说明

| 参数名   | 是否必须 | 数据类型        | 参数说明                                                                                                                                                    |
| -------- | -------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| path     | 是       | String / Array  | 路由配置，支持数组，例如： path: ["/mobile/news/xxx1", "/mobile/news/xxx2"]                                                                                 |
| edit     | 否       | Boolean         | 是否开启可视化                                                                                                                                              |
| ssr      | 否       | Boolean         | 是否开启服务端渲染，特别提醒：ssr 不支持 window，document，location，localStorage...等浏览器才有的对象，ssr 会增加服务端的负担，开启请慎重!                 |
| pxtorem  | 否       | Number/ Boolean | mobile 页面的默认值：75，pc 页面的默认值为：false，如果要禁止某一个 px 转 rem，请在具体样式后面添加 /\*no\*/                                                |
| cdncache | 否       | Number          | 默认值：120， 单位：秒， cdn 缓存时间                                                                                                                       |
| online   | 否       | Boolean         | 默认值为 true，该值仅作用于生产环境                                                                                                                         |
| tongji   | 否       | Boolean         | 默认值为 false, 如果开启，pc 会注入静态碎片 100163 的统计脚本，mobile 会注入静态碎片 25027 的统计脚本（mobile 注意在模板 head 中配置 gloableSettings 参数） |
| uiImg    | 否       | String / Array  | 默认值：''，ui 图片 url，方便 ui 图和实际页面对比,通过在路由中添加 /\_\_ui\_\_ 访问， 例：http://news.ifeng.com/loc/index1/__ui__                           |
| allData  | 否       | Object          | 配置的数据，会注入到 html 页面中                                                                                                                            |
| handler  | 否       | Boolean         | 默认值为 false，如果配置为 true，则说明你要自定义 handler.js, handler.js 是一个 nodejs 的路由处理方法，ctx 是请求的上下文                                   |

**path 详细说明：/mobile/news/loc/timeline 对应的级数 /第一级/第二级/第三级/第四级**

-   第一级： pc 或 mobile (同一个链接，用 pc 和 mobile 打开可以是两个不同的页面，根据 ua 来区分，如果只开发了 pc 或 mobile 页面，则不会分端)

-   第二级： 域名 (.ifeng.com 可以省略不写)

> 例如: https://news.ifeng.com/loc/timeline ，path 可以简写成： /mobile/news/loc/timeline ，或者完整 path：/mobile/news.ifeng.com/loc/timeline

-   第三级和之后：自定义

**allData 详细说明:**

allData 配置是用来获取 rpc 数据的，分为包含两种方式， transferV3 和 transferV4，通过 rpc 查询后，会返回所有数据

-   transferV3： 通过调用 KVProxy.getAll_v2 来获取数据（getAll_v2 天生就是用来批量获取数据的，推荐使用 transferV3，从目前的经验来看，transferV3 能满足你 99%的获取 rpc 碎片数据的需求，**有条数限制：推荐位，动态碎片，精品池，每个 id 最多返回 30 条数数据，请特别注意**）

-   transferV4： 通过调用 KVProxy.getXXX 每个独立的方法来获取数据，是 rpc 提供的原始方法，没有任何限制

**其他参数：如有 ctx.params，则会挂载到 allData 上，allData 还支持你配置纯静态数据，会原封不动的添加到 allData 上**

下面是一个 allData 的 demo，allData 的配置可以通过[allData 生成工具](http://sys-manager.shank.ifeng.com/utils/kvtool/)来生成

        module.exports = {
            path: '/mobile/sports/loc/beijing2022/client',
            pxtorem: 75,
            cdncache: 120,
            edit: true,
            ssr: true,
            online: true,
            allData: {
                transferV3: [
                    ['top:体育-奥运会-奥运会h5-置顶', 'KVProxy', 'getRecommendFragment', '285674', {"filter":["thumbnails","title","type","url","base62Id","summary", "newsTime", "newStyle"]}],
                    ["homeconfig","KVProxy","getStructuredFragment","260144",{}]

                ]
            },
        };

**ssr 说明:**

开启 ssr 后，本地开发请添加?ssr=true 进行访问，通过浏览器查看源码来判断 ssr 是否生效，或者看项目启动的命令行窗口是否有 ssr 的错误（ssr 报错绝大部分情况都是因为 window 对象引起，请特别注意）

开启 ssr 后，如果要禁止某一个组件 ssr：请使用 NoSSR 标签包裹对应的组件，如下所示

```
import NoSSR from 'react-no-ssr';

... 省略部分代码

<NoSSR>
    <header />
</NoSSR>

<NoSSR>
    <list />
</NoSSR>

... 省略部分代码
```

**handler.js 说明:**

-   handler.js 是 allData 配置的增强版，可以自定义你的数据获取脚本
-   可以引入 src 目录中自定义的方法或模块（推荐使用 commonjs 规范，如： require('./xxx')来引入）
-   不能引入 node_modules 中的任何第三方包
-   handler.js 导出一个 promise 方法，该方法拥有一个参数：ctx （ctx 代表 http 的请求上下文，详情请查看 koa 文档）
-   handler.js 导出的方法，必须有返回值，返回值只能是 { allData:{}, adKeys: [] } 或 { next: false }

handler.js 内置了一些常用方法和库，无需引入（也不要自己引入，否则可能会导致内存泄漏），可以直接使用（如果要添加内置方法，请联系：lirq1）

    const moment = require('moment');
    const _ = require('lodash');
    const uuid = require('uuid/v4');
    const request = require('../../common/request');
    const Request = require('request');
    const ifeng_public_method = require('@ifeng/public_method');
    const kv = require('../common/common');
    const { transferV3, transferV4 } = kv;
    const { KVProxy, KVTableEnum } = require('@ifeng/ucmsapiProxy').ucmsapiProxy;
    const Tars = require('@tars/stream');
    const { md5 } = require('../../common/utils/security');
    const env = process.env.NODE_ENV;

handler.js 返回值说明

| 参数名  | 是否必须 | 数据类型 | 参数说明                                                                                            |
| ------- | -------- | -------- | --------------------------------------------------------------------------------------------------- |
| allData | 否       | Object   | allData 数据                                                                                        |
| adKeys  | 否       | Array    | 广告碎片的 key                                                                                      |
| next    | 否       | Boolean  | 默认值：true，一般不需要配置，除非你想中断之后的流程，例如：重定向（请参考 demo2），或自己响应 html |

handler.js 使用 demo1

    module.exports = async ctx => {
        // 第一步：使用 transferV3，获取部分数据
        let json1 = [
            ['SmallBanner3:小banner3', 'KVProxy', 'getStructuredFragment', '260138'],
            ['Stars:中外明星', 'KVProxy', 'getStructuredFragment', '260139'],
            ['SmallBanner4:小banner4', 'KVProxy', 'getStructuredFragment', '260140'],
            ['PlaceList:奥运场馆', 'KVProxy', 'getStructuredFragment', '260141'],
        ];
        let allData1 = await transferV3(ctx, json1);

        // 第二步：使用 transferV4，获取部分数据
        let json2 =  [
            ["crowd","KVProxy","getCrowd","85q0bsocjN2", {json: true}],
        ]
        let allData2 = await transferV4(ctx, json2);

        // 第三步：使用原始的kv方法，KVProxy.getCrowd，获取部分数据（请谨慎使用原始kv方法，需要自己处理返回值）
        let crowd2 = await KVProxy.getCrowd(ctx, '85q0bsocjN2');
        crowd2 = crowd2.response.return;

        return { allData: {...allData1,...allData2, crowd2}, adKeys: [] };
    };

handler.js 使用 demo2

    module.exports = async (ctx) => {
        ctx.status = 302;
        ctx.setCacheTime(120);
        ctx.redirect("https://www.ifeng.com");

        return { next: false };
    };

特别提示：不要用 handler.js 当做 http 接口服务来用，我们有专门的项目来放接口，如：web-feedflow-api 项目

### html 模板文件

如果 app.jsx 同级目录中，没有配置 index.html 文件，则会使用@ifeng/fepacker 内置的 index.html。
html 标准模板（如下）

```
<!DOCTYPE html>
<html xmlns:wb="http://open.weibo.com/wb" lang="zh">
    <head>
        <meta charset="utf-8">
        {{> head }}
    </head>
    <body>
        <div id="root"></div>
        {{> body }}
    </body>
</html>
```

#### 模板说明

脚手架内置 hbs 模板 和 ejs 模板，hbs 模板是编译时生效，ejs 模板是访问时生效

hbs 模板使用成对的大括号，例如：{{> head }}

ejs 模板使用闭合标签

例 1：动态注入 title

```
<title><%- allData.base?.pageTitle || "visa之队" %></title>
```

例 2：

```
<% if (allData.uiStatus) { %>
    <div>我是ui</div>
<% } %>
```

#### 内置的 hbs 模板（可以直接复制到页面 html 中使用）

一般情况下，index.html 只需要配置 {{> head }} 和 {{> body }} 即可

```
{{> head }}                 // 包含 {{> common/allData }}  {{> common/errorUpload }}  {{> common/pxtorem }} ，会根据实际情况自动配置，
{{> body }}                 // 包含 {{> common/uiImg}}
{{> common/allData }}       // head包含，自动配置
{{> common/errorUpload }}   // head包含，自动配置
{{> common/pxtorem }}       // head包含，自动配置
{{> common/goNative }}      // 需要手动配置，一般分享页需要
{{> common/uiImg}}          // body包含，自动配置
```

#### 自定义 hbs 模板

请在 package.json 中设置 hbsDir 目录，

```
"webpack": {
    "hbsDir": [
      "./src/hbs"  // 自定义hbs目录
    ],
    ...
}
```

自定义 hbs 模板示例：

```
|-- src
|   |-- hbs
|       |-- timeline_head.hbs           // hbs模板

```

timeline_head.hbs 文件

```
<style>
    body {
        font-size: 20px
    }
</style>
```

在 index.html 中使用 hbs 模板

```
<!DOCTYPE html>
<html xmlns:wb="http://open.weibo.com/wb">
    <head>
        <meta charset="utf-8">

        {{> timeline_head }}

        {{> head }}
    </head>

    <body>
        <div id="root"></div>

        {{> body }}
    </body>
</html>
```

### 警告

-   前端代码中不要使用 process.env.NODE_ENV ，请直接使用自定义的 NODE_ENV (测试和生产编译时，会强制 process.env.NODE_ENV = production)

-   关于三端组件引入 @ifeng/three_terminal/es/mobile/dynamic 如直接这样引入，webpack Tree Shaking 目前测试发现无法删除未使用代码，导致打出来的包特别大

##### 错误示例：

    import {QQShare, WxLaunchApp} from "@ifeng/three_terminal/es/mobile/dynamic";

##### 正确示例：

    import {QQShare} from "@ifeng/three_terminal/es/mobile/qqShare/dynamic";

    import {WxLaunchApp} from "@ifeng/three_terminal/es/mobile/wxLaunchApp/dynamic";

### 附录

常用的测试环境 host

    10.66.221.4 test.yue.ifeng.com test.canews.ifeng.com test.18.ifeng.com test.cci.ifeng.com test.a.ifeng.com test.bang.ifeng.com
    10.66.221.4 test.ref-xmllq-hz1.ifeng.com test.finance.ifeng.com test.innovation.ifeng.com test.pl.ifeng.com
    10.66.221.4 test.so.ifeng.com test.baby.ifeng.com test.ialbum.ifeng.com test.local.shank.ifengidc.com test0.local.shank.ifengidc.com
    10.66.221.4 test.imemory.ifeng.com test.d.shankapi.ifeng.com test.debug.shankapi.ifeng.com test.lapuda.ifeng.com
    10.66.221.4 test.auto.ifeng.com test.iauto.ifeng.com test.career.ifeng.com test.inews.ifeng.com test.i.ifeng.com
    10.66.221.4 test.www.ifeng.com test.food.ifeng.com test.foodnwine.ifeng.com test.v.ifeng.com test.tv.ifeng.com test.ient.ifeng.com
    10.66.221.4 test.home.ifeng.com test.fo.ifeng.com test.ishare.ifeng.com test.biz.ifeng.com test.f1.ifeng.com test.jiu.ifeng.com
    10.66.221.4 test.feng.ifeng.com test.dm.ifeng.com test.home.ifeng.com test.huanan.ifeng.com test.young.ifeng.com test.city.ifeng.com
    10.66.221.4 test.local.shank.ifengidc.com test.ent.ifeng.com test.mil.ifeng.com test.fashion.ifeng.com test.sports.ifeng.com
    10.66.221.4 test.news.ifeng.com test.ucms.ifeng.com test.photo.ifeng.com test.pit.ifeng.com test.tech.ifeng.com test.health.ifeng.com
    10.66.221.4 test.talk.ifeng.com test.travel.ifeng.com test.culture.ifeng.com test.guoxue.ifeng.com test.history.ifeng.com
    10.66.221.4 test.ds.ifeng.com test.gentie.ifeng.com test.vote.ifeng.com test.edu.ifeng.com  test.games.ifeng.com
    10.66.221.4 test.openucms.ifeng.com test.sx.ifeng.com test.isx.ifeng.com test.phtv.ifeng.com  test.shankapi.ifeng.com test.client.ifeng.com
    10.66.221.4 test.sd.ifeng.com test.ecresearch.ifeng.com test.5g.ifeng.com test.silu.ifeng.com test.gongyi.ifeng.com
    10.66.221.4 test.ifinance.ifeng.com  test.mall.ifeng.com test.www.bomboom.cn test.www.yhiudn7n.com test.gov.ifeng.com
    10.66.221.4 test.tousu.ifeng.com test.ifengzhishu.ifeng.com test.presents.ifeng.com test.group.ifeng.com

    10.66.240.11 test.h5.ifeng.com
