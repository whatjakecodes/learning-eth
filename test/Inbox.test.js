// contract test code will go here
const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const web3 = new Web3(ganache.provider())

const {abi, evm} = require("../compile")

describe('Inbox', function () {
    let accounts, inbox

    beforeEach(async () => {
        accounts = await web3.eth.getAccounts()

        inbox = await new web3.eth.Contract(abi)
            .deploy({data: evm.bytecode.object, arguments: ["hi there!"]})
            .send({from: accounts[0], gas: 1000000})
    })

    it('should deploy a contract', function () {
        assert.ok(inbox.options.address)
    })

    it('has a default message', async function () {
        const message = await inbox.methods.message().call()
        assert.equal(message, "hi there!")
    })

    it('have its message updated', async function () {
        await inbox.methods.setMessage("new message").send({from: accounts[0]})
        const message = await inbox.methods.message().call()

        assert.equal(message, "new message")
    })
})
