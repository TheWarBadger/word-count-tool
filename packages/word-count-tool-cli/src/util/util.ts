import { getWordCounter } from "@oceannaeco-tech-tests/word-count-tool-core";
import { EOL } from "node:os";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";

export const parseDisabledBreaks = (input: string): Array<string> => {
  // explicitly splitting to UTF-16 code points, see help text
  return input.split("");
};

export type ProcessStreamOptions = {
  debugPrinter?: (...args: any[]) => void;
  // should be single-characters, as required by word-counter-core
  disableSeperators?: Array<string>;
};

export const processStream = async (
  inputStream: Readable,
  options: ProcessStreamOptions,
) => {
  try {
    const wordCounter = getWordCounter({
      disableWordBreaks: options.disableSeperators,
      debugPrinter: options.debugPrinter,
    }).getInstance();

    inputStream.setEncoding("utf8");
    inputStream.on("readable", () => {
      for (
        let data = inputStream.read();
        data !== null;
        data = inputStream.read()
      ) {
        wordCounter.accept(data);
      }
    });

    await finished(inputStream);

    const countMap = wordCounter.finishedCount();
    const sortedCounts = Object.entries(countMap)
      .map(([k, v]) => ({
        word: k,
        count: v.count,
      }))
      .sort((lhs, rhs) => lhs.word.localeCompare(rhs.word));

    const outputString = sortedCounts
      .map((entry) => `${entry.word}: ${entry.count}`)
      .join(EOL);

    return outputString;
  } finally {
    inputStream.destroy();
  }
};
