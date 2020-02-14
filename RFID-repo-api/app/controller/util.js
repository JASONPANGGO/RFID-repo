const Controller = require('egg').Controller;
const {
    paramFilter
} = require('../lib/util')

class UtilController extends Controller {
    async upload() {
        try {
            const file = this.ctx.request.files[0]
            this.ctx.body = await this.ctx.service.util.upload(file)
        } catch (error) {
            throw error
        }
    }

}

module.exports = UtilController