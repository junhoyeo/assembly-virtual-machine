import { readFileStr } from 'https://deno.land/std/fs/mod.ts';

interface ILine {
  indent: number;
  tokens: string[];
}

const filterValidLines = (line: string) => {
  const lineWithoutComments = line.split(';')[0].trim();
  if (!lineWithoutComments) {
    return [];
  }
  return [line];
};

const tokenizeLines = (line: string): ILine => {
  let indent = 0;
  const lineWithoutComments = line.split(';')[0];
  const tokens = lineWithoutComments
    .split(' ')
    .filter((token: string) => {
      if (!token) {
        indent += 1;
        return false;
      }
      return true;
    });
  return { indent, tokens };
};

const text = await readFileStr('./test.asm');

const tokens = text
  .split('\n')
  .flatMap(filterValidLines)
  .map(tokenizeLines);
console.log(tokens);
