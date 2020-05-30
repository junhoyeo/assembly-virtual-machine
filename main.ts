import VirtualMachine from './machine.ts';

const vm = new VirtualMachine({
  verbose: true,
});
await vm.readFile('./test.asm');
vm.initializeTokenizer();
vm
  .tokenize()
  .forEach((v) => console.log(v));
vm.initializeParser();
vm.parse();
