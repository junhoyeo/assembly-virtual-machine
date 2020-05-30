import { readFileStr } from 'https://deno.land/std/fs/mod.ts';
import { Tokenizer } from './tokenizer.ts';
import { Parser } from './parser.ts';
import { Environment } from './environment.ts';

interface IVirtualMachineOptions {
  verbose?: boolean;
}

export default class VirtualMachine {
  verbose: boolean;
  text: string = '';

  tokens: Tokenizer.ILine[] = [];
  tokenizer: Tokenizer.Tokenizer | undefined;

  sectionGroups: Parser.ISectionGroups | undefined;
  parser: Parser.Parser | undefined;

  environment: Environment.Environment;

  constructor(options: IVirtualMachineOptions = {}) {
    const { verbose = false } = options;
    this.verbose = verbose;
    this.environment = new Environment.Environment(this.verbose);
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

  public parse = (): Parser.ISectionGroups => {
    if (!this.parser) {
      throw new Error('VirtualMachine.parser is not initialized.');
    }
    this.sectionGroups = this.parser.parse();
    return this.sectionGroups;
  };

  public execute = () => {
    if (!this.sectionGroups) {
      throw new Error('VirtualMachine.sectionGroups is not parsed.');
    }
    this.environment.read(this.sectionGroups);
    this.environment.execute();
  };
}
