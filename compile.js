const path = require('path')
const fs = require('fs')
const solc = require('solc')

const inboxPath = path.resolve(__dirname, 'contracts', 'Inbox.sol')
const source = fs.readFileSync(inboxPath, 'utf8');

const output = solc.compile(source, 1)

const inboxContract = output.contracts[':Inbox'];
module.exports = inboxContract;
