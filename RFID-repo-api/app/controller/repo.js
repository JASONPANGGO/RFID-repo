'use strict';

const Controller = require('egg').Controller;
const {
    paramFilter
} = require('../lib/util')

class RepoController extends Controller {

    async get() {
        const query = paramFilter(['id', 'instanceid', 'invite_code'], this.ctx.request.query)
        console.log(query)
        this.ctx.body = await this.ctx.service.repo.get(query)
    }

    async add() {
        const query = paramFilter(['instanceid', 'name'], this.ctx.request.body)
        this.ctx.body = await this.ctx.service.repo.add(query)
    }

    async invite() {
        const userInfo = this.ctx.session.userInfo
        const repoid = this.ctx.request.body.id
        if (userInfo['character'] !== 1) {
            this.ctx.status = 403
        } else {
            this.ctx.body = {
                invite_code: await this.ctx.service.repo.generateInviteCode(repoid)
            }
        }
    }

    async update() {
        const userInfo = this.ctx.session.userInfo
        const query = paramFilter(['id', 'name', 'status'], this.ctx.request.body)
        if (userInfo['character'] !== 1) {
            this.ctx.status = 403
        } else {
            this.ctx.body = await this.ctx.service.repo.update(query)
        }
    }
}

module.exports = RepoController