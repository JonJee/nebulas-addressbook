var Stubs = require('./contractStubs');
var AddressBookManager = require('./contract');

let LocalContractStorage = Stubs.LocalContractStorage;
let Blockchain = Stubs.Blockchain;

Blockchain.changeTransactionAfterGet = false;

let contract = new AddressBookManager();
contract.init();

contract.save('n1xxx', 'Jon Jee');
contract.save('n1xxy', 'Yoon Jee');
console.log(contract.save('n1123', 'JJJ'));
console.log(contract.edit('n1xxx', 'Jon Kim'));
// console.log(contract.edit('n1xxx1', 'Jon Kim'));
console.log(contract.delete('n1xxx'));
console.log(contract.delete('n1xxx1'));