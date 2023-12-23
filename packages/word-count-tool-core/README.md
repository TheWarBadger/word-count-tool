# word-count-tool-core

This is the core library for the Word Count Tool demonstration project. It's compiled to be compatible with CJS, ESM and Typescript.

## Usage

```ts
const wordsToCount = "hello world";

const wordCounter = getWordCounter({});
const wordCounterInstance = wordCounter.getInstance();
wordCounterInstance.accept(wordsToCount);

const countedWords = wordCounterInstance.finishedCount();

```

## API

```ts
// This could be Record<string, number>,
// but this has the advantage of being explicit about what each part means,
// as well as being extendable if we ever want to add meta-data to the counts.
export type WordCounterResult = { [word: string]: { count: number } };

// Built to support large inputs via streaming.
// Making the assumption that the output will be much smaller because
// tokens will be repeated frequently.
export type WordCounterInstance = {
  accept: (buffer: string) => void;
  finishedCount: () => WordCounterResult;
};

// Use of factory allows injection patterns instead of needing to use
// static functions.
export type WordCounter = {
  getInstance: () => WordCounterInstance;
};

export type WordCounterConfig = {
  // If provided, pass debug information to this function in the same way
  // you would to console.log().
  debugPrinter?: (...values: Array<any>) => void;
  // Array of delimiters to include as "word characters".
  // MUST be single UTF-16 code-point (IE the JS string length must be 1).
  disableWordBreaks?: Array<string>;
};
```