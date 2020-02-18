'use strict';

const Service = require('egg').Service;
const TABLE = 'task'

class TaskService extends Service {
    async get(query) {
        try {
            if (query['createrid'] && query['nextUserid']) {
                return await this.app.mysql.query(`select * from ${TABLE} where ${query.instanceid ? 'instanceid='+query.instanceid : 'repoid='+query.repoid} and (createrid=${query.createrid} or nextUserid=${query.nextUserid})`)
            } else {
                return await this.app.mysql.select(TABLE, {
                    where: query
                })
            }
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

    async delete(query) {
        try {
            return await this.app.mysql.delete(TABLE, query)
        } catch (error) {
            throw error
        }
    }
}

module.exports = TaskService