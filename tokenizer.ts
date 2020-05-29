export namespace Tokenizer {
  enum TokenIdentifier {
    COMMA = ',',
    SINGLE_QUOTE = "'",
    DOUBLE_QUOTE = '"',
  }

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
      let isCountingString = false;
      let temporaryToken = '';
      let temporaryString = '';

      const lineWithoutComments = line.split(';')[0];
      const tokens: string[] = [];

      for (let charIndex = 0; charIndex < lineWithoutComments.length; charIndex++) {
        const char = lineWithoutComments[charIndex].trim();

        if (isCountingString) {
          temporaryString += char;
          if (char === TokenIdentifier.SINGLE_QUOTE) {
            tokens.push(temporaryString);
            isCountingString = false;
            temporaryString = '';
          }
          continue;
        } else if (char === TokenIdentifier.COMMA) {
          if (temporaryToken) {
            tokens.push(temporaryToken);
            temporaryToken = '';
          }
          tokens.push(char);
          continue;
        }
        if (!char && isCountingIndent) {
          indent += 1;
          continue;
        } else if (char && isCountingIndent) {
          isCountingIndent = false;
        } else if (!char) {
          if (temporaryToken) {
            tokens.push(temporaryToken);
            temporaryToken = '';
          }
          continue;
        }
        if (char === TokenIdentifier.SINGLE_QUOTE) {
          if (!isCountingString) {
            isCountingString = true;
            temporaryString += char;
            continue;
          }
        }
        temporaryToken += char;
      }
      if (temporaryToken) {
        tokens.push(temporaryToken);
      }
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
