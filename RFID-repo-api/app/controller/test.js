'use strict';

const Controller = require('egg').Controller;
const {
    paramFilter,
    jsonParser
} = require('../lib/util')

class TestController extends Controller {
    async add() {
        this.ctx.body = await this.app.mysql.insert('rfid', [{
                rfid: '111',
                goodsid: '2'
            },
            {
                rfid: '222',
                goodsid: '2'
            },
            {
                rfid: '11234',
                goodsid: '2'
            },
            {
                rfid: '13241',
                goodsid: '2'
            },
            {
                rfid: '11234',
                goodsid: '2'
            },
        ])
    }


}
module.exports = TestController