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
}

module.exports = UserService;
