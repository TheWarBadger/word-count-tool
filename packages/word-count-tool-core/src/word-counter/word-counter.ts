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

// I usually try to stick to documenting my code using Clean Code principles
// (function names and signatures, and variable names), however in the case of regex
// that's not possible. For something this simple it's a judgement call, but not
// everyone is intimately familiar with the RegEx arcane runes.
//
// Matches any string which is a single word character ([A-Za-z0-9_]).
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Character_classes
const defaultSeperators = /^[^\w]+$/;
export const getWordCounter = (config: WordCounterConfig): WordCounter => {
  if (
    config.disableWordBreaks &&
    config.disableWordBreaks.findIndex((s) => s.length > 1) >= 0
  ) {
    throw new Error(
      "attempted to configure multi-charecter excluded word-break",
    );
  }

  const printDebug = (...values: any) => {
    if (config.debugPrinter) {
      config.debugPrinter(...values);
    }
  };

  const isSeperator = (char: string) => {
    if (
      config.disableWordBreaks &&
      config.disableWordBreaks.findIndex((s) => s === char) >= 0
    ) {
      return false;
    }

    const match = char.match(defaultSeperators);
    printDebug("Matching seperator...", { char, match });
    return !!match;
  };

  const wordCharacters: Array<string> = [];
  const wordCounts: Record<string, { count: number }> = {};
  const processWord = () => {
    const isEmptyWord = wordCharacters.length === 0;
    if (isEmptyWord) {
      printDebug("Processing Empty Word");
      return;
    }

    const rawWord = wordCharacters.join("");
    const caseNormalizedWord = rawWord.toLowerCase();
    printDebug("Processing Next Word", { rawWord, caseNormalizedWord });

    const isNewWord = wordCounts[caseNormalizedWord] === undefined;
    if (isNewWord) {
      wordCounts[caseNormalizedWord] = { count: 0 };
    }

    wordCounts[caseNormalizedWord].count++;
    wordCharacters.splice(0, wordCharacters.length);
  };

  return {
    getInstance: () => ({
      accept: (input: string) => {
        // If you ever want multi-codepoint seperators, then this
        // will have to be checked and updated to account for splitting
        // between accept calls.
        for (const char of input) {
          if (!isSeperator(char)) {
            wordCharacters.push(char);
          } else {
            processWord();
          }
        }
      },

      finishedCount: () => {
        processWord();
        return wordCounts;
      },
    }),
  };
};
