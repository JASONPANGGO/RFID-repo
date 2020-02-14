'use strict';
const fs = require('fs')
const path = require('path')

const Service = require('egg').Service;

class UtilService extends Service {
    async upload(file) {
        try {
            const fileName = `${Date.now()}.jpg`
            const filePath = path.join(this.config.imgUrl, fileName)
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

module.exports = UtilService