'use strict';

const Service = require('egg').Service;
const TABLE = 'repo'
const crypto = require('crypto')

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

    async generateInviteCode(repoid) {
        try {
            const md5 = crypto.createHash('md5')
            md5.update(Date.now().toString())
            const invite_code = md5.digest('hex')
            await this.app.mysql.update(TABLE, {
                id: repoid,
                invite_code: invite_code
            })
            return invite_code
        } catch (error) {
            throw error
        }
    }

    async update(query) {
        try {
            return await this.app.mysql.update(TABLE, query)
        } catch (error) {
            throw error
        }
    }

}

module.exports = RepoService