module.exports = {
    path: ['/mobile/news/loc/xxx'], // String类型 或 Array类型
    pxtorem: 75, // Boolean类型 或 Number类型：是否需要px2rem，如果想关闭pxtorem，请把该参数删掉 或者 改为false
    cdncache: 120, // Number类型：cdn缓存时间
    edit: false, // Boolean类型：是否开启可视化
    ssr: false, // Boolean类型：是否开启ssr
    online: false, // Boolean类型：是否上线，仅生产环境有效
    tongji: false, // Boolean类型：是否注入mobile统计脚本，注入的碎片地址是：25027
    uiImg: '', // String / Array 类型： UI走查用的图片链接
    allData: {}, // Object类型
    handler: false, // Boolean类型，默认值：fasle，如果设置为true，需要自己实现allData获取逻辑
};
