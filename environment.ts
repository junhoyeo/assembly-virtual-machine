import { Parser } from './parser.ts';

export namespace Environment {
  export class Environment {
    verbose: boolean;

    // TODO: store only pointer for data stack
    scope: { [key: string]: string | number } = {};

    constructor(verbose: boolean = false) {
      this.verbose = verbose;
      this._initializeRegisters();
    }

    private _initializeRegisters() {
    }

    public read(sectionGroups: Parser.ISectionGroups) {
      sectionGroups.data.forEach((section: Parser.IToken[], index) => {
        if (this.verbose) {
          console.log(`[*] Executing .data section #${index + 1}`);
        }
        section.forEach(({ command: variableName, props }: Parser.IToken) => {
          const command = props?.[0];
          if (command === 'db') {
            // store string literal
            const [string, terminator] = props?.[1] as [string, number];
            const trimmedString = string.slice(1, string.length - 1);

            // newline check(0xA)
            this.scope[variableName] = (terminator === 10) ?
              `${trimmedString}\n` : trimmedString;
            console.log(this.scope);
          } else if (command == 'equ') {
            // get length of variable
            if (props?.[1] === '$' && props?.[2] === '-') {
              const variableNameToGetLength = props.slice(-1)[0] as string;
              this.scope[variableName] = (this.scope[variableNameToGetLength] as string).length;
              console.log(this.scope);
            }
          }
        });
      });
      sectionGroups.text.forEach((section, index) => {
        if (this.verbose) {
          console.log(`[*] Executing .text section #${index + 1}`);
        }
      });
    }

    public execute() {
    }
  }
}
