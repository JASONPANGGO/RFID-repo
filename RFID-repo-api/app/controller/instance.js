'use strict';

const Controller = require('egg').Controller;
const {
    paramFilter
} = require('../lib/util')

class InstanceController extends Controller {
    async add() {
        const query = paramFilter(['name', 'types', 'create_time'], this.ctx.request.body)
        const userInfo = this.ctx.session.userInfo
        query.id = userInfo.id
        if (query.name && query.types instanceof Array && query.id && query.create_time) {
            const res = await this.ctx.service.instance.add(query)
            await this.ctx.service.user.update({
                id: userInfo.id,
                instanceid: res.insertId,
                character: 1
            })
            this.ctx.session.userInfo = Object.assign(this.ctx.session.userInfo, {
                id: userInfo.id,
                instanceid: res.insertId,
                character: 1
            })
            console.log('session：', this.ctx.session.userInfo)
            this.ctx.body = {
                status: 'success',
                instanceid: res.insertId
            }
        } else {
            this.ctx.status = 404
        }
    }

    async get() {
        try {
            const query = paramFilter(['instanceid', 'repoid'], this.ctx.request.query)
            const res = await this.ctx.service.instance.get({
                id: query.instanceid
            })
            if (query.repoid) {
                res['repoData'] = await this.ctx.service.repo.get({
                    id: query.repoid
                })
            }
            this.ctx.body = res
        } catch (error) {
            throw error
        }
    }

    async update() {
        try {
            const query = paramFilter(['id', 'name', 'goods_type'], this.ctx.request.body)
            this.ctx.body = await this.ctx.service.instance.update(query)
        } catch (error) {
            throw error
        }
    }
}
module.exports = InstanceController;