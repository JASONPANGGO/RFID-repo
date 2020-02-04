
module.exports = {
    /**
     * @param {Array} accept_keys 
     * @param {Object} params
     */
    paramFilter: (accept_keys, params) => {
        const filtedParams = {}
        if (accept_keys instanceof Array) {
            if (params instanceof Object) {
                accept_keys.forEach(key => {
                    if (params[key] !== undefined) filtedParams[key] = params[key]
                })
            } else {
                throw new Error('the second parameter must be an object')
            }
        } else {
            throw new Error('the first parameter must be an array')
        }
        return filtedParams
    },
    /**
     * @param {Array} accept_keys 
     * @param {Object} obj
     */
    jsonParser(accept_keys, obj) {
        for (key of accept_keys) {
            if (obj[key]) {
                obj[key] = JSON.parse(obj[key])
            }
        }
        return obj
    }
}