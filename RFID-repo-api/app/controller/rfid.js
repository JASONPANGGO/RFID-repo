'use strict';

const Controller = require('egg').Controller;
const {
    paramFilter,
    jsonParser
} = require('../lib/util')

class RfidController extends Controller {

    async get() {
        const query = paramFilter(['rfid', 'goodsid'], this.ctx.request.query)
        this.ctx.body = await this.ctx.service.rfid.get(query)
    }

    async add() {
        const query = paramFilter(['rfid', 'goodsid'], this.ctx.request.body)
        this.ctx.body = await this.ctx.service.rfid.add(query)
    }

}

module.exports = RfidController