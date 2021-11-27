// deploy code will go here
const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const {interface, bytecode} = require('./compile')

const provider = new HDWalletProvider(
    'walk thought bachelor beach salute label aim loan junior coffee inhale worry',
    'https://rinkeby.infura.io/v3/f54678ac0b17468ea21735519dd1c4ad'
)

const web3 = new Web3(provider)
