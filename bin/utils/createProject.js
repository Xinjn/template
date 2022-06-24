const fs = require('fs')
const path = require('path')
const shelljs = require("shelljs")
const { promisify } = require('util')
const { createVideo: createPCVideo } = require('./preComponent/pc/video')
const { createComment: createPCComment } = require('./preComponent/pc/comment')

const writeFile = promisify(fs.writeFile)

/**
 * 创建项目
 * 
 * @param {String} rootPath 创建项目的根目录地址
 * @param {Object} sourceData 源对象，即将转换成文件
 * @param {Array} chipData 碎片信息
 * @param {Object} setting 一些额外的设置
 * */
exports.createProject = async (rootPath, sourceData, chipData, setting) => {
    // project 的根文件夹
    const rootFolder = path.join(rootPath, `/__tmp_split__`)
    shelljs.exec(`rm -rf ${rootFolder}`)
    shelljs.mkdir('-p', rootFolder)
    shelljs.mkdir('-p', path.join(rootFolder, '/layout'))

    const createFile = async (data, filePath) => {
        let folder
        if (data.id === '0') {
            folder = filePath
        } else {
            folder = path.join(filePath, `/${data.name}`)
            shelljs.mkdir('-p', folder)
        }

        shelljs.exec('touch index.css', { cwd: folder })
        shelljs.exec('touch index.jsx', { cwd: folder })
        let jsxImport = [`import React, { PureComponent } from 'react';`, `import styles from './index.css';`]
        let jsxFunction = []
        let jsxRender = []
        if (data.config) {
            if (data.config.component) {
                // propTypes
                if (data.config.component.props) {
                    jsxImport.push(`import PropTypes from 'prop-types';`)
                    let propTypesContent = `static propTypes = {\n`
                    data.config.component.props.forEach((p, index) => {
                        propTypesContent += `\t\t${p.key}: ${p.customType ? p.customType : `PropTypes.${p.type}`}${index === data.config.component.props.length - 1 ? '' : ','}\n`
                    })
                    propTypesContent += `\t}`
                    jsxFunction.unshift(propTypesContent)
                }
                if (data.config.component.preComponent) {
                    const { preComponent } = data.config.component
                    for (let comp of preComponent) {
                        if (comp.type === 'pc') {
                            switch (comp.name) {
                                case 'video': createPCVideo(jsxImport, jsxFunction, jsxRender); break;
                                case 'comment': createPCComment(jsxImport, jsxFunction, jsxRender); break;
                                default: ''
                            }
                        }
                        if (comp.type === 'mobile') {

                        }
                    }
                }
            }
        }

        // 做最后的组装
        let finalContent = ``
        finalContent += jsxImport.join('\n') + '\n\n'
        finalContent += `class ${data.name} extends PureComponent {` + '\n\n'
        finalContent += jsxFunction.map(a => `\t${a}`).join('\n') + '\n\n'
        finalContent += `\trender () {\n\t\treturn (\n\t\t\t<div>`
        finalContent += jsxRender.map(a => `\t\t\t\t${a}`).join('\n')
        finalContent += `\n\t\t\t</div>\n\t\t)\n\t}`
        finalContent += `\n}`
        finalContent += `\n\nexport default ${data.name}`

        await writeFile(path.resolve(folder, './index.jsx'), finalContent)

        if (data.children) {
            for (let d of data.children) {
                await createFile(d, folder)
            }
        }
    }

    await createFile(sourceData, path.join(rootFolder, '/layout'))

    // chipMap.js，仅放置split里生成的碎片
    let chipMap = `export const ChipMap = {`
    for (const i in chipData) {
        const chip = chipData[i]
        chipMap += `\n\t${chip.chipData.name}: {\n\t\tid: '${chip.chipId}',\n\t\tname: '${chip.chipData.name}', \n\t\ttype: '${chip.chipType}',\n\t\ttitle: '${chip.chipData.title}',\n\t\tgroupName: '${chip.chipData.group}'\n\t}${Number(i) === chipData.length - 1 ? '' : ','}`
    }
    chipMap += '\n}'
    shelljs.exec('touch chipMap.js', { cwd: rootFolder })
    await writeFile(path.resolve(rootFolder, './chipMap.js'), chipMap)

    // 应用 dependencies.txt
    if (setting.isCreateDependenciesText) {
        shelljs.exec('touch dependencies.txt', { cwd: rootFolder })
        await writeFile(path.resolve(rootFolder, './dependencies.txt'), '// 可能需要安装的依赖：\n\n' + setting.isCreateDependenciesText.join('\n'))
    }
}
