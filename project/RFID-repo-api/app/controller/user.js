'use strict';
const Controller = require('egg').Controller;
const {
    paramFilter
} = require('../lib/util')
// const crypto = require('crypto')
// const md5 = crypto.createHash('md5')

class UserController extends Controller {
    async get() {
        try {
            const query = this.ctx.request.query;
            const accept_keys = ['name', 'id'];
            console.log('get');
            console.log(query);
            const accept_query = {};
            const result = {};
            accept_keys.forEach(key => {
                if (query[key] !== undefined) accept_query[key] = query[key];
            });
            result.data = await this.ctx.service.user.get(accept_query);
            this.ctx.body = result;
        } catch (error) {
            throw error;
        }
    }

    async login() {
        try {
            const query = paramFilter(['code', 'userInfo'], this.ctx.request.query);
            const code = query.code
            const wxLoginResult = await this.app.curl(`https://api.weixin.qq.com/sns/jscode2session?appid=${this.config.AppID}&secret=${this.config.AppSecret}&js_code=${code}&grant_type=authorization_code`, {
                dataType: 'json',
            });
            const result = await this.ctx.service.user.login({
                openid: wxLoginResult.data.openid,
                userInfo: query.userInfo
            })
            this.ctx.body = result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserController;