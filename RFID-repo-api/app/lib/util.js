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
                    filtedParams[key] = params[key]
                })
            } else {
                throw new Error('the second parameter must be an object')
            }
        } else {
            throw new Error('the first parameter must be an array')
        }
        return filtedParams
    }
}