'use strict';

const Controller = require('egg').Controller;
const {
    paramFilter
} = require('../lib/util')

class RepoController extends Controller {

    async get() {
        const query = paramFilter(['id', 'instanceid'], this.ctx.request.query)
        console.log(this.ctx.request.query)
        console.log(query)
        this.ctx.body = await this.ctx.service.repo.get(query)

    }

    async add() {
        const query = paramFilter(['instanceid', 'name'], this.ctx.request.body)
        this.ctx.body = await this.ctx.service.repo.add(query)
    }

}

module.exports = RepoController