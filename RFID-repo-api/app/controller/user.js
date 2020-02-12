'use strict';
const Controller = require('egg').Controller;
const {
    paramFilter
} = require('../lib/util')

class UserController extends Controller {
    async get() {
        try {

            const query = paramFilter(['name', 'id', 'instanceid', 'repoid'], this.ctx.request.query)

            this.ctx.body = await this.ctx.service.user.get(query);
        } catch (error) {
            throw error;
        }
    }

    async login() {
        try {
            const query = paramFilter(['code', 'userInfo'], this.ctx.request.body);
            console.log('登录：', query.userInfo)
            const code = query.code
            // 得到openid
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

    async update() {
        try {
            const query = paramFilter(['id', 'name', 'avatarUrl', 'instanceid', 'repoid', 'character'], this.ctx.request.body)
            this.ctx.body = await this.ctx.service.user.update(query)
        } catch (error) {
            throw error
        }
    }

    async join() {
        try {
            const query = paramFilter(['id', 'instanceid', 'repoid', 'character'], this.ctx.request.body)
            await this.ctx.service.task.add({
                instanceid: query.instanceid,
                repoid: query.repoid,
                createrid: query.id,
                type: 2,
                status: 2,
                name: '加入仓库'
            })
            this.ctx.body = await this.ctx.service.user.update(query)
        } catch (error) {
            throw error
        }
    }

    async quit() {
        try {
            const query = paramFilter(['id', 'instanceid', 'repoid', 'character'], this.ctx.request.body)
            await this.ctx.service.task.add({
                instanceid: query.instanceid,
                repoid: query.repoid,
                createrid: query.id,
                type: 3,
                status: 2,
                name: '退出仓库'
            })
            this.ctx.body = await this.ctx.service.user.update({
                id: query.id,
                instanceid: null,
                repoid: null,
                character: 0
            })
        } catch (error) {
            throw error
        }
    }
}

module.exports = UserController;