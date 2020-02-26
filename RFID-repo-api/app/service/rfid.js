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

    async update(query) {
        return await this.app.mysql.query(`update ${TABLE} set status=${query.status} where ${query.rfid.map(r=>`rfid='${r}'`).join(' OR ')}`)
    }
}

module.exports = RfidService