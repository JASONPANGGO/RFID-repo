'use strict';

const Service = require('egg').Service;
const TABLE = 'user'

class UserService extends Service {
    async get(query) {
        try {
            let res
            if (Object.keys(query).length === 0) {
                res = await this.app.mysql.select(TABLE)
            } else {
                res = await this.app.mysql.get(TABLE, query)
            }
            if (res instanceof Array || !res) {
                return res
            } else {
                return [res]
            }
        } catch (error) {
            throw error
        }
    }

    async login(query) {
        let res = await this.app.mysql.get(TABLE, {
            openid: query.openid
        })

        if (!res) res = await this.register(query)

        // 存储对应用户的userInfo，返回的时候伴随cookie，下次接口调用的时候识别cookie拿到该session
        this.ctx.session.userInfo = res

        return res
    }

    async register(query) {
        await this.app.mysql.insert(TABLE, {
            openid: query.openid,
            name: JSON.parse(query.userInfo)['nickName'],
            avatarUrl: JSON.parse(query.userInfo)['avatarUrl']
        })

        return await this.app.mysql.get(TABLE, {
            openid: query.openid
        })
    }

    async update(query) {
        try {
            return await this.app.mysql.update(TABLE, query)
        } catch (error) {
            throw error
        }
    }

    checkSession() {
        try {
            const userInfo = this.ctx.session.userInfo
            console.log(userInfo)
            if (userInfo) return userInfo
            else this.ctx.body = {
                message: 'expire'
            }
        } catch (error) {
            throw error
        }
    }



}

module.exports = UserService;