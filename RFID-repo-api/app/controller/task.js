'use strict';

const Controller = require('egg').Controller;
const {
    paramFilter,
    jsonParser
} = require('../lib/util')

class TaskController extends Controller {
    async get() {
        const query = paramFilter(['id', 'instanceid', 'repoid', 'goodsid', 'status', 'nextUserid', 'createrid'], this.ctx.request.query)
        console.log('get task', query)
        this.ctx.body = {
            taskData: await this.ctx.service.task.get(query),
            userData: await this.ctx.service.user.get(query.instanceid ? {
                instanceid: query.instanceid
            } : {
                repoid: query.repoid
            }),
            repoData: await this.ctx.service.repo.get(query.instanceid ? {
                instanceid: query.instanceid
            } : {
                id: query.repoid
            }),
            goodsData: await this.ctx.service.goods.get(query.instanceid ? {
                instanceid: query.instanceid
            } : {
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
        const query = paramFilter(['id', 'status', 'nextUserid', 'progress'], this.ctx.request.body)
        this.ctx.body = await this.ctx.service.task.update(query)
    }

    async finish() {
        const query = paramFilter(['id', 'progress', 'nextUserid', 'rfid', 'task_type', 'goodsid'], this.ctx.request.body)
        console.log('task finish', query)
        if (query.task_type === 1) { // 进货
            await this.ctx.service.rfid.add(query.rfid.map(d => {
                return {
                    rfid: d,
                    goodsid: query.goodsid
                }
            }))

            await this.app.mysql.query(`update goods set amount=amount+${query.rfid.length} where id=${query.goodsid}`)
        } else if (query.task_type === 0) { // 出货
            await this.ctx.service.rfid.update({
                rfid: query.rfid,
                status: 1
            })

            await this.app.mysql.query(`update goods set amount=amount-${query.rfid.length} where id=${query.goodsid}`)
        }

        this.ctx.body = await this.ctx.service.task.update({
            id: query.id,
            status: 2,
            progress: query.progress,
            nextUserid: query.nextUserid
        })

    }
}

module.exports = TaskController