'use strict';

const Controller = require('egg').Controller;
const {
    paramFilter,
    jsonParser
} = require('../lib/util')

class RfidController extends Controller {

    async get() {
        const query = paramFilter(['rfid', 'goodsid'], this.ctx.request.query)
        console.log('rfid/get', query)
        this.ctx.body = await this.ctx.service.rfid.get(query)
    }

    async add() {
        const query = paramFilter(['rfid', 'goodsid', 'amount', 'rfidSum'], this.ctx.request.body)
        let dataList = query.goodsid && query.rfid instanceof Array && query.rfid.map(d => {
            return {
                rfid: d,
                goodsid: query.goodsid
            }
        })

        // 只有当库存多于该商品rfid数量的时候才不更新库存
        if (query.amount <= query.rfidSum + dataList.length) {
            await this.ctx.service.goods.update({
                id: query.goodsid,
                amount: query.rfidSum + dataList.length
            })
        }
        this.ctx.body = await this.ctx.service.rfid.add(dataList)
    }

    async update() {
        const query = paramFilter(['rfid', 'goodsid', 'status'], this.ctx.request.body)
        this.ctx.body = await this.ctx.service.rfid.update(query)
    }

}

module.exports = RfidController