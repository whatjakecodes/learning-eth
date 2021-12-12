const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')

const web3 = new Web3(ganache.provider())
const {compileFn} = require("../compile-fn")

describe('Lottery Contract', async () => {
    let lottery, accounts
    let abi, evm

    before(() => {
        const contract = compileFn("Lottery")
        abi = contract.abi
        evm = contract.evm
    })

    beforeEach(async () => {
        accounts = await web3.eth.getAccounts()
        lottery = await getLottery(abi, evm, accounts[0])
    })

    it('should deploy', async () => {
        assert.ok(lottery.contract.options.address)
        const players = await lottery.getPlayers(accounts[0])
        assert.equal(players.length, 0)
    })

    it('should let 1 account enter the lottery', async () => {
        await lottery.enter(accounts[0], '0.02')
        const players = await lottery.getPlayers(accounts[0])

        assert.equal(players.length, 1)
        assert.equal(players[0], accounts[0])
    })

    it('should let multiple accounts enter the lottery', async () => {
        await lottery.enter(accounts[0], '0.01')
        await lottery.enter(accounts[1], '0.4')

        const players = await lottery.getPlayers(accounts[0])

        assert.deepEqual(players, [accounts[0], accounts[1]])
    })

    it('should require minimum amount of ether to enter', async () => {
        try {
            await lottery.enter(accounts[3], '0.009')
        } catch (error) {
            assert(error)
            return
        }
        assert.fail("error should have been thrown")
    })

    it('should only allow manager to pick winner', async () => {
        await lottery.enter(accounts[1], '0.01')
        await lottery.enter(accounts[2], '0.03')
        try {
            await lottery.pickWinner(accounts[1])
        } catch (error) {
            assert(error)
            return
        }
        assert.fail("error should have been thrown")
    })
})

const getLottery = async (abi, evm, managerAccount) => {
    const contract = await new web3.eth.Contract(abi)
        .deploy({data: evm.bytecode.object})
        .send({from: managerAccount, gas: 1000000})

    const enter = async (account, etherValue) => {
        const value = web3.utils.toWei(etherValue, 'ether')
        return await contract.methods.enter().send({
            from: account,
            value,
            gas: 300000
        })
    }

    const getPlayers = async (from) => {
        return await contract.methods.getPlayers().call({from})
    }

    const pickWinner = async (from) => {
        return await contract.methods.pickWinner().call({from})
    }

    return {
        enter,
        getPlayers,
        pickWinner,
        contract
    }
}