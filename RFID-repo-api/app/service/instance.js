'use strict';

const Service = require('egg').Service;
const TABLE = 'instance'

class InstanceService extends Service {
    async add(query) {
        try {
            let res = await this.app.mysql.insert(TABLE, {
                createrid: query.id,
                name: query.name,
                goods_type: query.types.join(',')
            })
            console.log(res)
            return res
        } catch (error) {

        }
    }

    async get(query) {
        try {
            const res = {}
            res.instanceData = await this.app.mysql.get(TABLE, query)
            res.createrData = await this.ctx.service.user.get({
                id: res.instanceData.createrid
            })
            return res
        } catch (error) {
            throw error
        }
    }
}
module.exports = InstanceService;