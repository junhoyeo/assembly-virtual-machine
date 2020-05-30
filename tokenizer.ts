export namespace Tokenizer {
  enum TokenIdentifier {
    COMMA = ',',
    SINGLE_QUOTE = "'",
    DOUBLE_QUOTE = '"',
  }

  export type TToken = string | string[];

  export interface ILine {
    indent: number;
    tokens: Array<TToken>;
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
      let temporaryArguments: string[] = [];
      let isPreviousTokenComma = false;

      const lineWithoutComments = line.split(';')[0];
      const tokens: Array<TToken> = [];

      for (let charIndex = 0; charIndex < lineWithoutComments.length; charIndex++) {
        const char = lineWithoutComments[charIndex];

        if (isCountingString) {
          temporaryString += char;
          if (char === TokenIdentifier.SINGLE_QUOTE) {
            tokens.push(temporaryString);
            isCountingString = false;
            temporaryString = '';
          }
          continue;
        }

        const trimmedChar = char.trim();
        if (!trimmedChar && isCountingIndent) {
          // trim and count indent levels
          indent += 1;
          continue;
        } else if (trimmedChar && isCountingIndent) {
          // stop counting indent levels
          isCountingIndent = false;
        } else if (!trimmedChar) {
          // end of current token
          if (isPreviousTokenComma && temporaryToken) {
            // collect arguments
            if (temporaryToken) {
              temporaryArguments.push(temporaryToken);
              temporaryToken = '';
            }
            tokens.push(temporaryArguments);
            temporaryArguments = [];
            continue;
          }
          if (temporaryToken) {
            tokens.push(temporaryToken);
            temporaryToken = '';
          }
          continue;
        }
        if (trimmedChar === TokenIdentifier.SINGLE_QUOTE) {
          if (!isCountingString) {
            isCountingString = true;
            temporaryString += trimmedChar;
            continue;
          }
        } else if (char === TokenIdentifier.COMMA) {
          if (temporaryToken) {
            temporaryArguments.push(temporaryToken);
            temporaryToken = '';
          } else {
            const poppedToken = tokens.pop();
            if (poppedToken && typeof poppedToken === 'string') {
              temporaryArguments.push(poppedToken);
            }
          }
          isPreviousTokenComma = true;
          continue;
        }
        temporaryToken += trimmedChar;
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
