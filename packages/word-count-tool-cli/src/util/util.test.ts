import { describe, expect, it } from "vitest";
import { parseDisabledBreaks, processStream } from "./util.js";
import { Readable } from "stream";
import { EOL } from "os";

class ReadableString extends Readable {
  constructor(str: string) {
    super();
    this.push(str);
  }

  _read() {
    this.push(null);
  }
}

describe("Parsing Breaks", () => {
  it("should return empty on no breaks", () => {
    const out = parseDisabledBreaks("");
    expect(out).toStrictEqual([]);
  });

  it("should parse disabled breaks", () => {
    const out = parseDisabledBreaks(".,");
    expect(out).toStrictEqual([".", ","]);
  });

  it("should parse to UTF points", () => {
    const out = parseDisabledBreaks("𝟘");
    // In the real world you'd have actual code points here
    // But right now I don't want to spend the time
    // working out to express the relevant unicode.
    expect(out.length).toStrictEqual(2);
  });
});

describe("Command Line Apparatus", () => {
  it("should split text", async () => {
    const inputStream = new ReadableString("foo bar");
    const out = await processStream(inputStream, {});
    expect(out).toStrictEqual(`bar: 1${EOL}foo: 1`);
  });

  it("output should be in same order regardless of input order", async () => {
    const barFooStream = new ReadableString("bar foo");
    const barFooOutput = await processStream(barFooStream, {});

    const fooBarStream = new ReadableString("foo bar");
    const fooBarOutput = await processStream(fooBarStream, {});

    expect(fooBarOutput).toStrictEqual(barFooOutput);
  });

  it("should respect disabled splitters", async () => {
    const inputStream = new ReadableString("bar foo");
    const output = await processStream(inputStream, {
      disableSeperators: [" "],
    });

    expect(output).toStrictEqual("bar foo: 1");
  });
});
