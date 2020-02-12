'use strict';

const Service = require('egg').Service;
const TABLE = 'task'

class TaskService extends Service {
    async get(query) {
        try {
            const res = await this.app.mysql.select(TABLE, {
                where: query
            })
            return res
        } catch (error) {
            throw error
        }
    }

    async add(query) {
        try {
            console.log('service add task', query)
            return await this.app.mysql.insert(TABLE, query)
        } catch (error) {
            throw error
        }
    }

    async update(query) {
        try {
            return await this.app.mysql.update(TABLE, query)
        } catch (error) {
            throw error
        }
    }
}

module.exports = TaskService