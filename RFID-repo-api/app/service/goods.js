'use strict';

const Service = require('egg').Service;
const TABLE = 'goods'

class GoodsService extends Service {
    async get(query) {
        try {
            return await this.app.mysql.select(TABLE, {
                where: query
            })
        } catch (error) {
            throw error
        }
    }
}
module.exports = GoodsService