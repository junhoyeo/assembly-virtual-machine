export namespace Tokenizer {
  export interface ILine {
    indent: number;
    tokens: string[];
  }

  export class Tokenizer {
    verbose: boolean;
    text: string = '';

    constructor(text: string, verbose: boolean = false) {
      this.text = text;
      this.verbose = verbose;
    }

    private _filterValidLines = (line: string): string[] => {
      const lineWithoutComments = line.split(';')[0].trim();
      if (!lineWithoutComments) {
        return [];
      }
      return [line];
    };

    private _tokenizeLines = (line: string): ILine => {
      let indent = 0;
      let isCountingIndent = true;
      const lineWithoutComments = line.split(';')[0];
      const tokens = lineWithoutComments
        .split(' ')
        .filter((token: string) => {
          if (!token && isCountingIndent) {
            indent += 1;
            return false;
          } else if (token && isCountingIndent) {
            isCountingIndent = false;
          } else if (!token) {
            return false;
          }
          return true;
        });
      return { indent, tokens };
    };

    public tokenize = (): ILine[] => {
      const tokens = this.text
        .split('\n')
        .flatMap(this._filterValidLines)
        .map(this._tokenizeLines);
      if (this.verbose) {
        console.log('[*] Tokenized lines:', tokens);
      }
      return tokens;
    };
  }
}
