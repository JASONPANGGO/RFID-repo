'use strict';

const Controller = require('egg').Controller;
const {
    paramFilter,
    jsonParser
} = require('../lib/util')

class GoodsController extends Controller {
    async get() {
        try {
            const query = paramFilter(['id', 'instanceid', 'repoid', 'type', 'order', 'name', 'bar_code'], this.ctx.request.query)
            jsonParser(['repoid', 'type'], query)
            console.log('get goods', query)
            this.ctx.body = await this.ctx.service.goods.get(query)
        } catch (error) {
            throw error
        }
    }

    async add() {
        try {
            const userInfo = this.ctx.session.userInfo
            const query = paramFilter(['name', 'type', 'price', 'amount', 'bar_code', 'repoid', 'img_url', 'comment'], this.ctx.request.body)
            query.instanceid = userInfo.instanceid
            console.log('add goods', query)
            this.ctx.body = await this.ctx.service.goods.add(query)
        } catch (error) {
            throw error
        }
    }

    async update() {
        try {
            const query = paramFilter(['id', 'name', 'type', 'price', 'amount', 'bar_code', 'repoid', 'img_url', 'comment'], this.ctx.request.body)
            const user = (await this.ctx.service.user.get({
                id: this.ctx.session.userInfo.id
            }))[0]
            this.ctx.session.userInfo = user
            const character = user.character
            if (character > 2) {
                this.ctx.status = 403
                this.ctx.body = user
            } else {
                this.ctx.body = await this.ctx.service.goods.update(query)
            }
        } catch (error) {
            throw error
        }
    }

    async delete() {
        try {
            const query = paramFilter(['id'], this.ctx.request.body)
            const character = (await this.ctx.service.user.get({
                id: this.ctx.session.userInfo.id
            }))[0].character
            if (character > 2) {
                this.ctx.status = 403
            } else {
                await this.ctx.service.goods.delete(query)
                await this.ctx.service.task.delete({
                    goodsid: query.id
                })
                this.ctx.status = 200
            }
        } catch (error) {
            throw error
        }
    }

}

module.exports = GoodsController