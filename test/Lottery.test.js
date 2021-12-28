const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')

const web3 = new Web3(ganache.provider())
const {compileFn} = require("../compile-fn")

describe('Lottery Contract', async () => {
    let lottery, accounts
    const {abi, evm} = compileFn("Lottery")

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
            await lottery.contract.methods.pickWinner().send({from: accounts[1]})
        } catch (error) {
            assert.ok(error)
            return
        }
        assert.fail("error should have been thrown")
    })

    it('should send money to winner and reset players', async () => {
        await lottery.enter(accounts[1], '2')
        await lottery.enter(accounts[2], '3')
        const lotteryValue = 5

        const account1StartBalance = await lottery.getPlayerBalance(accounts[1])
        const account2StartBalance = await lottery.getPlayerBalance(accounts[2])

        await lottery.pickWinner()

        const account1EndBalance = await lottery.getPlayerBalance(accounts[1])
        const account2EndBalance = await lottery.getPlayerBalance(accounts[2])

        const didAccount1Win = (account1EndBalance - account1StartBalance) === lotteryValue
        const didAccount2Win = (account2EndBalance - account2StartBalance) === lotteryValue

        assert((didAccount1Win && !didAccount2Win) || (!didAccount1Win && didAccount2Win))
    })
})

const getLottery = async (abi, evm, managerAccount) => {
    const contract = await new web3.eth.Contract(abi)
        .deploy({data: evm.bytecode.object})
        .send({from: managerAccount, gas: 1000000})

    const enter = async (from, etherValue) => {
        const weiValue = web3.utils.toWei(etherValue, 'ether')
        return await contract.methods.enter().send({
            from,
            value: weiValue
        })
    }

    const getPlayers = async (from) => {
        return await contract.methods.getPlayers().call({from})
    }

    const getPlayerBalance = async (account) => {
        const weiBalance = await web3.eth.getBalance(account);
        return web3.utils.fromWei(weiBalance, 'ether')
    }

    const pickWinner = async () => {
        return await contract.methods.pickWinner().send({from: managerAccount})
    }

    return {
        enter,
        getPlayers,
        getPlayerBalance,
        pickWinner,
        contract
    }
}