'use strict';

const Controller = require('egg').Controller;
const {
    paramFilter,
    jsonParser
} = require('../lib/util')

class TaskController extends Controller {
    async get() {
        console.log(this.ctx.request.header)
        const query = paramFilter(['id', 'instanceid', 'repoid'], this.ctx.request.query)
        console.log(query)
        this.ctx.body = {
            taskData: await this.ctx.service.task.get(query),
            userData: await this.ctx.service.user.get(query),
            repoData: await this.ctx.service.repo.get(query),
            goodsData: await this.ctx.service.goods.get(query)
        }
    }
    async add() {
        const query = paramFilter(['instanceid', 'repoid', 'type', 'name', 'goodsid', 'amount', 'nextUserid', 'createrid', 'comment', 'status'], this.ctx.request.body)
        console.log(query)
        this.ctx.body = this.ctx.service.task.add(query)
    }

    async update() {
        const query = paramFilter(['id', 'status', 'nextUserid'], this.ctx.request.body)
        this.ctx.body = this.ctx.service.task.update(query)
    }
}

module.exports = TaskController