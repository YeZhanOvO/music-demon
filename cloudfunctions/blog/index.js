// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const TcbRouter = require('tcb-router')
const db = cloud.database()
const blogConnection = db.collection('blog')

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event })
  app.router('list', async (ctx, nexr) => {
    ctx.body = await blogConnection.skip(event.start).limit(event.count).orderBy('createTime', 'desc').get().then((res) => {
      return res.data
    })
  })
  return app.serve()
}