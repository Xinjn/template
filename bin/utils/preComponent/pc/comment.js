/**
 * 预设组件-评论
 * @param {Array} jsxImport import 部分
 * @param {Array} jsxFunction 函数、方法部分
 * @param {Array} jsxRender 渲染部分
 *
 * 以上的数组都需要改变原数据
 * */
exports.createComment = (jsxImport, jsxFunction, jsxRender) => {
    jsxImport.push(`import { Comment } from '@ifeng/three_terminal/es/pc/comment';`)
    jsxRender.push(`
                <Comment
                   articleInfo={{
                      noAd: true,
                      // 文章单页的页面地址 commentUrl TODO
                      docUrl: '',
                      // 文章的标题 TODO
                      docTitle: '',
                      skey: '',
                      speUrl: '',
                      pcUrl: '',
                      cmtNumUrl: 'https://comment.ifeng.com/get.php',
                      cmtLength: 1000,
                      cmtPostUrl: 'https://comment.ifeng.com/post.php',
                      hotLimit: 2,
                      cmtVoteUrl: 'https://comment.ifeng.com/vote.php',
                      replyLimit: 3,
                      jubUrl: 'https://comment.ifeng.com/report',
                      jubNum: 0,
                      isComment: false
                   }}
                />`)
}
