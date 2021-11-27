// contract test code will go here
const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')

const {interface, bytecode} = require("../compile")

const web3 = new Web3(ganache.provider());


describe('Inbox', function () {
    let accounts, inbox

    beforeEach(async () => {
        accounts = await web3.eth.getAccounts()

        inbox = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({data: bytecode, arguments: ["hi there!"]})
            .send({from: accounts[0], gas: '1000000'})
    })

    it('should deploy a contract', function () {
        assert.ok(inbox.options.address)
    })
})
