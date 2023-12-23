import { beforeEach, describe, expect, it } from "vitest";
import { WordCounterInstance, getWordCounter } from "./word-counter";

describe("word-counter", () => {
  describe("single buffer/ascii tests", () => {
    let instance: WordCounterInstance;
    beforeEach(() => {
      const wordCounter = getWordCounter({});
      instance = wordCounter.getInstance();
    });

    it("should count a single word", () => {
      const testString = "test_word";
      instance.accept(testString);
      const count = instance.finishedCount();
      expect(count).toEqual({ test_word: { count: 1 } });
    });

    it("should count a single word surrounded by whitespace", () => {
      const testString = " test_word ";
      instance.accept(testString);
      const count = instance.finishedCount();
      expect(count).toEqual({ test_word: { count: 1 } });
    });

    it("should count two words split by whitespace", () => {
      const testString = "test_word_1 test_word_1";
      instance.accept(testString);
      const count = instance.finishedCount();
      expect(count).toEqual({ test_word_1: { count: 2 } });
    });

    it("should count two different words", () => {
      const testString = "test_word_1 test_word_2";
      instance.accept(testString);
      const count = instance.finishedCount();
      expect(count).toEqual({
        test_word_1: { count: 1 },
        test_word_2: { count: 1 },
      });
    });

    it("should split correctly for multiple dividers", () => {
      const testString = "test_word_1  test_word_1";
      instance.accept(testString);
      const count = instance.finishedCount();
      expect(count).toEqual({ test_word_1: { count: 2 } });
    });

    it("should be case-agnostic", () => {
      const testString = "TEST_WORD_1  test_word_1";
      instance.accept(testString);
      const count = instance.finishedCount();
      expect(count).toEqual({ test_word_1: { count: 2 } });
    });

    it("should split on punctuation", () => {
      const testString = "test_word_1.test_word_2";
      instance.accept(testString);
      const count = instance.finishedCount();
      expect(count).toEqual({
        test_word_1: { count: 1 },
        test_word_2: { count: 1 },
      });
    });

    it("should count long unicode as word-breaks", () => {
      const testString = "word1🏳️‍🌈word2";
      instance.accept(testString);
      const count = instance.finishedCount();
      expect(count).toEqual({ word1: { count: 1 }, word2: { count: 1 } });
    });
  });

  describe("Custom word breaking", () => {
    it("should respect explicitly disabled word-breaks", () => {
      const splitter = getWordCounter({ disableWordBreaks: ["."] });
      const instance = splitter.getInstance();
      const testString = "word1.word2";
      instance.accept(testString);
      const count = instance.finishedCount();
      expect(count).toEqual({ "word1.word2": { count: 1 } });
    });

    it("should throw if disabled word-breaks are multi-character", () => {
      expect(() => {
        getWordCounter({ disableWordBreaks: ["XX"] });
      }).toThrowError(
        "attempted to configure multi-charecter excluded word-break",
      );
    });
  });
});
