import VirtualMachine from './machine.ts';

const vm = new VirtualMachine({
  verbose: true,
});
await vm.readFile('./test.asm');
vm.initialize();
vm.tokenize();
