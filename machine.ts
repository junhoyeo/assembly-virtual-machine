import { readFileStr } from 'https://deno.land/std/fs/mod.ts';
import { Tokenizer } from './tokenizer.ts';

interface IVirtualMachineOptions {
  verbose?: boolean;
}

export default class VirtualMachine {
  verbose: boolean;
  text: string = '';
  tokenizer: Tokenizer.Tokenizer | undefined;

  constructor(options: IVirtualMachineOptions = {}) {
    const { verbose = false } = options;
    this.verbose = verbose;
  }

  public async readFile(filename: string): Promise<void> {
    this.text = await readFileStr(filename);
  }

  public initialize = (): Tokenizer.Tokenizer => {
    this.tokenizer = new Tokenizer.Tokenizer(this.text, this.verbose);
    if (this.verbose) {
      console.log('[*] Initialized Tokenizer:', this.tokenizer)
    }
    return this.tokenizer;
  };

  public tokenize = (): Tokenizer.ILine[] => {
    if (!this.tokenizer) {
      throw new Error('VirtualMachine.tokenizer is undefined.');
    }
    return this.tokenizer.tokenize();
  };
}
