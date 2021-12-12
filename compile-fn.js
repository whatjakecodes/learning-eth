const path = require('path')
const fs = require('fs')
const solc = require('solc')

const compileFn = (contractName) => {

    let contractFilename = contractName + '.sol';
    const contractPath = path.resolve(__dirname, 'contracts', contractFilename)
    const source = fs.readFileSync(contractPath, 'utf8')

    const input = {
        language: 'Solidity',
        sources: { },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    }

    input.sources[contractFilename] = {
        content: source,
    }

    const output = solc.compile(JSON.stringify(input))
    let outputJson = JSON.parse(output);
    if (outputJson.errors) {
        console.error(outputJson.errors)
        throw new Error(output)
    }

    console.log("Compiled ", contractFilename)

    return outputJson.contracts[contractFilename][contractName]
}

module.exports = {compileFn}
