'use strict';

const Service = require('egg').Service;
const TABLE = 'rfid'

class RfidService extends Service {
    async get(query) {
        return await this.app.mysql.select(TABLE, {
            where: query
        })
    }

    async add(dataList) {
        return await this.app.mysql.insert(TABLE, dataList)
    }
}

module.exports = RfidService