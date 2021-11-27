// deploy code will go here
const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const {abi,evm} = require('./compile')

const provider = new HDWalletProvider(
    'walk thought bachelor beach salute label aim loan junior coffee inhale worry',
    'https://rinkeby.infura.io/v3/f54678ac0b17468ea21735519dd1c4ad'
)

const web3 = new Web3(provider)
const deploy = async () => {
    const accounts = await web3.eth.getAccounts()
    console.log("Attempting to deploy from account ", accounts[0])

    const contractSendMethod = new web3.eth.Contract(abi)
        .deploy({data: evm.bytecode.object, arguments: ["hello, rinkeby!"]})

    const result = await contractSendMethod.send({from: accounts[0], gas: 1000000})
    console.log('Contract deployed to ', result.options.address)

    // prevent a hanging deployment
    provider.engine.stop()
}
deploy()
