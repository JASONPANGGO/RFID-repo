'use strict';

const Service = require('egg').Service;
const TABLE = 'repo'

class RepoService extends Service {

    async add(query) {
        try {
            const res = await this.app.mysql.insert(TABLE, {
                instanceid: query.instanceid,
                name: query.name
            })
            return res
        } catch (error) {
            throw error
        }
    }

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

module.exports = RepoService