import { Tokenizer } from './tokenizer.ts';

export namespace Parser {
  export interface IToken {
    command: string;
    props: Array<string | number | (string | number)[]>;
  }

  export interface ISection {
    type: string;
    body: IToken[];
  }

  export interface ISectionGroups {
    data: Array<IToken[]>;
    text: Array<IToken[]>;
  }

  export class Parser {
    verbose: boolean;
    tokens: Tokenizer.ILine[] = [];

    constructor(tokens: Tokenizer.ILine[], verbose: boolean = false) {
      this.tokens = tokens;
      this.verbose = verbose;
    }

    private _parseNumberIfParseable = (value: string) => {
      const parsedNumber = parseInt(value);
      if (isNaN(parsedNumber)) {
        return value;
      }
      return parsedNumber;
    };

    private _parseSections = () => {
      let currentSectionIndex = -1;

      const sections: ISection[] = [];
      this.tokens.forEach(({ indent, tokens: [command, ...props] }) => {
        if (command === 'section') {
          const [sectionType] = props;
          sections[++currentSectionIndex] = {
            type: sectionType as string,
            body: [],
          };
        } else {
          sections[currentSectionIndex].body.push({
            command: command as string,
            props: props.map((prop: Tokenizer.TToken) => {
              if (typeof prop === 'string') {
                return this._parseNumberIfParseable(prop);
              }
              return prop.map((value: string) => this._parseNumberIfParseable(value));
            }),
          })
        }
      });
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

    private _logSectionGroup = (section: IToken[]) => section.map((token) => console.log(token));

    public parse = () => {
      const sections = this._parseSections();
      const groups = this._groupSectionsByType(sections);

      if (this.verbose) {
        console.log('[*] Parsed data sections:');
        groups.data.forEach(this._logSectionGroup);

        console.log('[*] Parsed text sections:');
        groups.text.forEach(this._logSectionGroup);
      }
      return groups;
    };
  }
}
