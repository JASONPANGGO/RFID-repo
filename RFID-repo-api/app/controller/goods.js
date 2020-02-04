'use strict';

const Controller = require('egg').Controller;
const {
    paramFilter,
    jsonParser
} = require('../lib/util')

class GoodsController extends Controller {
    async get() {
        try {

            const query = paramFilter(['instanceid', 'repoid', 'type', 'order', 'name'], this.ctx.request.query)
            jsonParser(['repoid', 'type'], query)

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
            this.ctx.body = await this.ctx.service.goods.add(query)
        } catch (error) {
            throw error
        }
    }

    async upload() {
        try {
            const file = this.ctx.request.files[0]
            this.ctx.body = await this.ctx.service.goods.upload(file)
        } catch (error) {
            throw error
        }
    }

}

module.exports = GoodsController