module.exports = (options, app) => {
    return async function auth(ctx, next) {
        console.log('auth')
        const userInfo = ctx.session.userInfo
        if (userInfo) await next(userInfo)
        else ctx.body = {
            message: 'expire'
        }
    }
}