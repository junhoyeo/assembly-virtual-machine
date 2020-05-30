import { readFileStr } from 'https://deno.land/std/fs/mod.ts';
import { Tokenizer } from './tokenizer.ts';
import { Parser } from './parser.ts';

interface IVirtualMachineOptions {
  verbose?: boolean;
}

export default class VirtualMachine {
  verbose: boolean;
  text: string = '';
  tokens: Tokenizer.ILine[] = [];
  tokenizer: Tokenizer.Tokenizer | undefined;
  parser: Parser.Parser | undefined;

  constructor(options: IVirtualMachineOptions = {}) {
    const { verbose = false } = options;
    this.verbose = verbose;
  }

  public async readFile(filename: string): Promise<void> {
    this.text = await readFileStr(filename);
  }

  public initializeTokenizer = (): Tokenizer.Tokenizer => {
    this.tokenizer = new Tokenizer.Tokenizer(this.text, this.verbose);
    if (this.verbose) {
      console.log('[*] Initialized Tokenizer:', this.tokenizer);
    }
    return this.tokenizer;
  };

  public tokenize = (): Tokenizer.ILine[] => {
    if (!this.tokenizer) {
      throw new Error('VirtualMachine.tokenizer not initialized.');
    }
    this.tokens = this.tokenizer.tokenize();
    return this.tokens;
  };

  public initializeParser = (): Parser.Parser => {
    this.parser = new Parser.Parser(this.tokens, this.verbose);
    if (this.verbose) {
      console.log('[*] Initialized Parser:', this.parser);
    }
    return this.parser;
  };

  public parse = () => {
    if (!this.parser) {
      throw new Error('VirtualMachine.parser is not initialized.');
    }
    return this.parser.parse();
  };
}
