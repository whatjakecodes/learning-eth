const {compileFn} = require('./compile-fn')

const compiledContract = compileFn('Lottery')

module.exports = compiledContract