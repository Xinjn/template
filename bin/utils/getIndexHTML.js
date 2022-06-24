const fs = require('fs')
const path = require('path')
const showdown = require('showdown')
const { promisify } = require('util')
const request = require('../../services/request')
const { VersionTip } = require('../html/versionTip')

const readFile = promisify(fs.readFile)

/**
 * 获取启动页的 html，可注入数据
 *
 * @param {Object} data 注入的数据
 * @param {String} data.pcList pc页面列表
 * @param {String} data.mobileList mobile页面列表
 *
 * */
exports.getIndexHTML = async (data) => {
    let html = await readFile(path.resolve(__dirname, './../html/index.html'))
    html = html.toString()
    Object.entries(data).forEach(([key, value]) => {
        const pattern = new RegExp(`{{${key}}}`, 'g')
        html = html.replace(pattern, value)
    })
    /**
     * 获取 fepackerVersion 版本，如果小于最新版，就提示升级
     */
    const packageJSON = require(path.resolve(process.cwd(), './package.json'))
    const localFepackerVersion = packageJSON.dependencies['@ifeng/fepacker'].replace(/^[\^~]{1}/g, '') // 本地版本，去掉了^~之类的
    let versionRes = await request.get({ url: 'http://npm.ifengcloud.ifeng.com/-/verdaccio/sidebar/@ifeng/fepacker', json: true });
    let lastFepackerVersion = Object.keys(versionRes.versions).reverse().find(a => !a.includes('test')) // 远程上的最新版本
    try {
        lastFepackerVersion = /\d{1,2}\.\d{1,2}\.\d{1,2}/g.exec(lastFepackerVersion)[0]
        // 对比版本号比较麻烦，直接对比是否一致
        if (localFepackerVersion < lastFepackerVersion) {
            // 不一致，提示
            html = html.replace('{{versionTip}}', VersionTip(localFepackerVersion, lastFepackerVersion))
        } else {
            // 一致，清掉{{}}
            html = html.replace('{{versionTip}}', '')
        }
    } catch (e) {
        html = html.replace('{{versionTip}}', '')
    }


    /**
     * 填充 tips
     * */
    const converter = new showdown.Converter({
        "omitExtraWLInCodeBlocks":true,
        "tables":true,
        ghCompatibleHeaderId: true,
        literalMidWordUnderscores: true,
        "tasklists":true,
        strikethrough: true,
    })
    let Tips = await readFile(path.resolve(__dirname, '../../readme.md'))

    Tips = Tips.toString()
    // Tips = Tips.replace(/test_/g, 'test\\_')
    // Tips = Tips.replace(/prod_/g, 'prod\\_')
    // Tips = Tips.replace(/ThreeTerminal_/g, 'ThreeTerminal\\_')
    // Tips = Tips.replace(/_dynamic/g, '\\_dynamic')
    // Tips = Tips.replace(/__/g, '\\_\\_')
    // Tips = Tips.replace(/NODE_ENV /g, 'NODE\\_ENV ')
    html = html.replace('{{tips}}',converter.makeHtml(Tips)) // 转换后的 html 字符串，string

    return html
}
