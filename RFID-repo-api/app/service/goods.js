'use strict';
const fs = require('fs')
const path = require('path')

const Service = require('egg').Service;
const TABLE = 'goods'

class GoodsService extends Service {
    async get(query) {
        try {
            let querystring = []
            let orderstring = ''
            for (let key in query) {
                if (query[key] instanceof Array) {

                    if (key === 'type') {
                        querystring.push(query[key].map(v => {
                            return ` ${key}='${v}' `
                        }).join('OR'))
                    } else {
                        querystring.push(query[key].map(v => {
                            return ` ${key}=${v} `
                        }).join('OR'))
                    }

                } else {
                    if (key === 'order') {
                        switch (parseInt(query.order)) {
                            case 0:
                                orderstring = ` create_time DESC`
                                break;
                            case 1:
                                orderstring = ` create_time`
                                break;
                            case 2:
                                orderstring = ' amount'
                                break;
                            case 3:
                                orderstring = ' amount DESC'
                                break;
                            default:
                                break;
                        }
                        orderstring = 'ORDER BY' + orderstring
                    } else if (key === 'name') {
                        querystring.push(` ${key} LIKE '%${query[key]}%'`)
                    } else {
                        querystring.push(` ${key}=${query[key]} `)
                    }
                }
            }
            return await this.app.mysql.query(`SELECT * FROM ${TABLE} WHERE ${querystring.join(' AND ')} ${orderstring}`)
        } catch (error) {
            throw error
        }
    }

    async add(query) {
        try {
            return await this.app.mysql.insert(TABLE, query)
        } catch (error) {
            throw error
        }
    }

    async upload(file) {
        try {
            const fileName = `${Date.now()}.jpg`
            const filePath = path.join('./app/public/img', fileName)
            fs.writeFileSync(filePath, fs.readFileSync(file.filepath))
            return {
                code: 200,
                message: 'ok',
                img_url: fileName
            }
        } catch (error) {
            throw error
        }
    }
}
module.exports = GoodsService