# word-count-tool-cli

Demonstraition CLI tool for word-counting.

## Usage

```bash
word-count-tool input-file.txt
```

## Reference

```text
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
```