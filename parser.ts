import { Tokenizer } from './tokenizer.ts';

export namespace Parser {
  export interface Token {
    command: string;
    props: any[];
  }

  export interface ISection {
    type: string;
    body: any[];
  }

  export interface ISectionGroups {
    data: any[];
    text: any[];
  }

  export class Parser {
    verbose: boolean;
    tokens: Tokenizer.ILine[] = [];

    constructor(tokens: Tokenizer.ILine[], verbose: boolean = false) {
      this.tokens = tokens;
      this.verbose = verbose;
    }

    private _parseSections = () => {
      let currentSectionIndex = -1;

      const sections: ISection[] = [];
      this.tokens.forEach(({ indent, tokens: [command, ...props] }) => {
        console.log(indent, command, props);
        if (command === 'section') {
          const [sectionType] = props;
          sections[++currentSectionIndex] = {
            type: sectionType,
            body: [],
          };
        } else {
          sections[currentSectionIndex].body.push({
            command,
            props,
          })
        }
      });
      console.log(sections);
      return sections;
    }

    private _groupSectionsByType(sections: ISection[]) {
      const groups: ISectionGroups = {
        data: [],
        text: [],
      };
      sections.forEach((section) => {
        if (section.type === '.text') {
          groups.text.push(section.body);
        } else if (section.type === '.data') {
          groups.data.push(section.body);
        }
      });
      return groups;
    }

    private _execute = (sections: ISection[]) => {
      const groups = this._groupSectionsByType(sections);
      groups.data.forEach((section, index) => {
        if (this.verbose) {
          console.log(`[*] Executing .data section #${index + 1}`);
        }
        section.forEach(({ command, props }: Token) => {
          if (command === 'msg') {
            const [] = props;
          }
        });
      });
      groups.text.forEach((section, index) => {
        if (this.verbose) {
          console.log(`[*] Executing .text section #${index + 1}`);
        }
        section.forEach((v: Token) => console.log(v));
      });
    }

    public parse = () => {
      const sections = this._parseSections();
      return this._execute(sections);
    };
  }
}
