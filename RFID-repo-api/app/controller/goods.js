'use strict';

const Controller = require('egg').Controller;
const {
    paramFilter
} = require('../lib/util')

class GoodsController extends Controller {
    async get() {

    }

    async add(userInfo) {
        try {
            console.log(userInfo)
            const query = paramFilter(['name', 'price', 'amount', 'bar_code'], this.ctx.request.query)
            
            // await this.ctx.service.goods.add(query)
        } catch (error) {

        }
    }

}

module.exports = GoodsController