import * as fs from "node:fs";
import { Readable } from "node:stream";
import { parseArgs } from "node:util";
import { parseDisabledBreaks, processStream } from "./util/util.js";

const args = parseArgs({
  allowPositionals: true,
  options: {
    disableSeperators: {
      type: "string",
      short: "d",
    },
    debug: {
      type: "boolean",
      short: "D",
    },
    help: {
      type: "boolean",
      short: "h",
    },
  },
});

const helpString = `
Word Counting Tool
---

Usage: word-count-tool <filename | "-"> [-d disabledSeperators] [-h]

---

This is a simple tool which counts words in a document.

The expected input encoding is UTF-8.

Output will be sorted alphabetically.

The first positional argument should either be a filename (E.G. "./path/to/file.txt") or a dash ("-").
If "-" is received then the input will be taken from stdin.

Only ASCII word characters, as defined by the JavaScript Regex Character Class "\\w" are counted as
words, everything else which isn't explicitly disabled is counted as a seperator.

For details on the "\\w" character class, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Character_classes .

This tool DOES NOT EXPLICITLY SUPPORT UNICODE. By default, any unicode outside of the JS Word
character class and the explicitly disabled seperators will be treated as a seperator.

Unicode characters MAY be passed to --disableSeperators, however anything that does not fit in a JS 
UTF-16 character will be interpretted as its equivalent UTF-16 code points.

This tool supports explicitly including word characters via the --disableSeperators option. Example:

Input   | --disableSeperators | Output (concatenated to single line)
------------------------------------------------------------------
"X Y"   | ""                  | X: 1, Y: 1
"X-Y"   | ""                  | X: 1, Y: 1
"X-Y.Z" | "-"                 | X-Y: 1, Z: 1
"X-Y.Z" | ".-"                | X-Y.Z: 1

Supported Options:

-h | --help: Print this message.
-D | --debug: Print debugging information to stderr
-d | --disableSeperators [seperator_string]: string of characters that should be treated as word characters.
`;
if (args.values.help) {
  console.log(helpString);
  process.exit(0);
}

const filePath = args.positionals[0];
if (!filePath) {
  console.error("ERROR: missing file-path as first argument");
  process.exit(1);
}

const debugPrinter = args.values.debug
  ? (...vals: any[]) => console.error(...vals)
  : () => {};

try {
  let readStream: Readable;
  if (filePath === "-") {
    readStream = process.stdin;
  } else {
    readStream = fs.createReadStream(filePath);
  }

  const disableSeperators = args.values.disableSeperators
    ? parseDisabledBreaks(args.values.disableSeperators)
    : undefined;
  const output = await processStream(readStream, {
    disableSeperators,
    debugPrinter,
  });

  console.log(output);
} catch (err) {
  let msg: string;
  if (err instanceof Error) {
    msg = err.message;
  } else {
    msg = String(err);
  }
  console.error("ERROR: ", msg);
  process.exit(1);
}
