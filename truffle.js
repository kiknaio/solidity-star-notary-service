// Allows us to use ES6 in our migrations and tests.
const HDWalletProvider = require('truffle-hdwallet-provider');
require('babel-register')

const mnemonic = "lounge amused slot badge whip manage muscle planet attract ostrich forget funny";

// Edit truffle.config file should have settings to deploy the contract to the Rinkeby Public Network.
// Infura should be used in the truffle.config file for deployment to Rinkeby.

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/86dce9348d394844be05a18bbd2e187f"),
      network_id: 4,
      gas: 3000000,
      gasPrice: 10000000000
    },
  },
  compilers: {
    solc: {
      version: '^0.4.24',
    }
  }
}
