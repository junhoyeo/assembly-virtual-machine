import { Parser } from './parser.ts';

export namespace Environment {
  export enum Registers {
    EAX = 'eax',
    EBX = 'ebx',
    ECX = 'ecx',
    EDX = 'edx',
  }

  export type TRegisters = {
    [registerName in Registers]: number | string | null;
  }

  export class Environment {
    verbose: boolean;
    registers: TRegisters;
    dataSection: Parser.IToken[][] = [];
    textSection: Parser.IToken[][] = [];

    // TODO: store only pointer for data stack
    scope: { [key: string]: string | number } = {};

    constructor(verbose: boolean = false) {
      this.verbose = verbose;
      this.registers = {
        eax: null,
        ebx: null,
        ecx: null,
        edx: null,
      }
    }

    public read(sectionGroups: Parser.ISectionGroups) {
      const { data: dataSection, text: textSection } = sectionGroups;
      this.dataSection = dataSection;
      this.textSection = textSection;
    }

    public execute() {
      this.dataSection.forEach((section: Parser.IToken[], index) => {
        if (this.verbose) {
          console.log(`[*] Executing .data section #${index + 1}`);
        }
        section.forEach(({ command: variableName, props }: Parser.IToken) => {
          const command = props?.[0];
          if (command === 'db') {
            // TODO: https://stackoverflow.com/questions/19526725/what-is-the-syntax-to-define-a-string-constant-in-assembly
            // store string literal
            const [string, terminator] = props?.[1] as [string, number];
            const trimmedString = string.slice(1, string.length - 1);

            // newline check(0xA)
            this.scope[variableName] = (terminator === 10) ?
              `${trimmedString}\n` : trimmedString;
          } else if (command == 'equ') {
            // get length of variable
            if (props?.[1] === '$' && props?.[2] === '-') {
              const variableNameToGetLength = props.slice(-1)[0] as string;
              this.scope[variableName] = (this.scope[variableNameToGetLength] as string).length;
            }
          }
          if (this.verbose) {
            console.log(JSON.stringify(this.scope));
          }
        });
      });
      this.textSection.forEach((section, index) => {
        if (this.verbose) {
          console.log(`[*] Executing .text section #${index + 1}`);
        }
        section.forEach(({ command, props }: Parser.IToken) => {
          console.log('\n', command, props);
          if (command === 'mov') {
            const [destination, source] = props?.[0] as string[];
            const destinationIndex = destination as Registers;
            const sourceData = typeof source === 'string' ?
              this.scope[source] : source as number;

            this.registers[destinationIndex] = sourceData;
            if (this.verbose) {
              console.log(`[+] Instruction`, { command, destination, source: sourceData });
              console.log('[*] Registers:', JSON.stringify(this.registers));
            }
          }
        });
      });
    }
  }
}
