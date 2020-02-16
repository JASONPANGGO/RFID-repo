'use strict';

const Controller = require('egg').Controller;
const {
    paramFilter,
    jsonParser
} = require('../lib/util')

class TaskController extends Controller {
    async get() {
        const query = paramFilter(['id', 'instanceid', 'repoid', 'goodsid', 'status'], this.ctx.request.query)
        console.log('get task', query)
        this.ctx.body = {
            taskData: await this.ctx.service.task.get(query),
            userData: await this.ctx.service.user.get(query.instanceid ? query : {
                repoid: query.repoid
            }),
            repoData: await this.ctx.service.repo.get(query.instanceid ? query : {
                id: query.repoid
            }),
            goodsData: await this.ctx.service.goods.get(query.instanceid ? query : {
                repoid: query.repoid
            })
        }
    }
    async add() {
        const query = paramFilter(['instanceid', 'repoid', 'type', 'name', 'goodsid', 'amount', 'nextUserid', 'createrid', 'comment', 'status'], this.ctx.request.body)
        console.log('add task', query)
        this.ctx.body = await this.ctx.service.task.add(query)
    }

    async update() {
        const query = paramFilter(['id', 'status', 'nextUserid'], this.ctx.request.body)
        const character = 
        this.ctx.body = await this.ctx.service.task.update(query)
    }
}

module.exports = TaskController