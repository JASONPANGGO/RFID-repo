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
        if (!res) {
            return await this.register(query)
        } else {
            return res
        }
    }

    async register(query) {
        await this.app.mysql.insert(TABLE, {
            openid: query.openid,
            name: JSON.parse(query.userInfo)['nickName']
        })

        return {
            character: 0
        }
    }
}

module.exports = UserService;