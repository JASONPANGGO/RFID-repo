'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
    async get() {
        try {
            const query = this.ctx.request.query
            const accept_keys = ['name', 'id']
            console.log('get')
            console.log(query)
            const accept_query = {}
            const result = {}
            accept_keys.forEach(key => {
                if (query[key] !== undefined) accept_query[key] = query[key]
            })
            result.data = await this.ctx.service.user.get(accept_query)
            this.ctx.body = result
        } catch (error) {
            throw error
        }
    }
}

module.exports = UserController;
