/**
 * 预设组件-视频
 * @param {Array} jsxImport import 部分
 * @param {Array} jsxFunction 函数、方法部分
 * @param {Array} jsxRender 渲染部分
 *
 * 以上的数组都需要改变原数据
 * */
exports.createVideo = (jsxImport, jsxFunction, jsxRender) => {
    jsxImport.push(`import { Player } from '@ifeng/three_terminal/es/pc/video';`)
    jsxRender.push(`
                <Player
                    key=''
                    videoConfig={{
                        // 视频标题 TODO
                        title: '',
                        // 视频缩略图 TODO
                        posterUrl: '',
                        // 视频播放地址 TODO
                        videoPlayUrl: ''
                    }}
                    playermsg={{
                        width: 325,
                        height: 183,
                        autoPlay: false,
                        controls: true
                    }}
                />`)
}
