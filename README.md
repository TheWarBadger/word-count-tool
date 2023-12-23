# Word Count Tool

This is a word counting tool built as a demonstration project, with an emphasis on being production ready. As such, certain choices have been made in order to demonstrate patterns which would not necesarily usually be used in a project of this scope. These are discussed later on in this file.

## Getting Started

Built for Node.js `v20.10.0`.

Building and Running:

```bash
# root package
yarn install
yarn build

# cli package 
cd packages/word-count-tool-cli
yarn word-count-tool ./example-text-files/input-example.txt
```

### Gotchas for Yarn and VSCode

#### Yarn4

This is built using Yarn `4.X`. This should "just work" assuming you have a modern Node installed and have enabled corepack.

If you get errors to do with not being able to find the right Yarn version, try running:

```bash
corepack enable
```

#### Yarn PnP SDKs

The yarn SDKs, required to get VSCode to work with PnP, are
committed to the git repository so it _should_ just work. However I've found that despite logic and documentation claiming otherwise sometimes it fails for unknown reasons. If VSCode is for whatever reason not picking up types properly then I've found that re-running the SDK
configuration can often fix mysterious problems.

```bash
yarn dlx @yarnpkg/sdks vscode vim
```

#### Build Order

The "build" target in the root package ensures that the core library is built first
by using the `-t` option for the `yarn workspaces foreach` command. This ensures
that the command is run in order of dependency.

## Usage Reference

Full usage for the tool, also available from `word-count-tool --help`:

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

## Assumptions and Design Choices

### Project Structure

Most obviously, I decided to split the business logic (AKA the actual word counting) and the command line interface into seperate packages using Yarn Workspaces.

This is over-kill for such a small project, but for more general utilities this improves re-usability, code seaming and separation of concerns.

Incidentally it also allows me to demonstrate the use of a baby mono-repo, although in a real situation Lerna and Turbo-Repo would probably become involved in order to stream-line builds.

Workspace support used to be a bit touch and go, but at time of working its benefits can often out-weigh the disadvantages.

One gotcha for development is that the typescript server in VSCode does not, as far as I can tell, yet fully support
multiple typescript versions. I believe that currently you can get around this by opening each workspace in a new VSCode window and it will automatically detect that it's part of a higher level git repository, however when I've used it previously we made the decision to have typescript
configured in the root workspace in order to avoid needing to do that. This is what I've done here.

### Business Assumptions

#### ASCII only

I've made the assumption that we'll only be tokenizing ASCII text.

First because as soon as you start getting into word-splitting and non-UTF characters you start needing to discuss business logic and localization, up and into natural language processing. That's _almost_ a comparable
can of worms to timezone management, so I've excluded it
for the purposes of this project.

ASCII only text also allows us to do a nice streaming implementation, which will handle large files without needing to load them all into memory (assuming that due to word duplication the output will be much smaller). If you
need to manage unicode points in a streaming scenario you have to make sure that graphemes being split between buffers doesn't cause confusion with premature word-breaks. This is probably possible but would take more thought than suitable for this project.

#### Default Word Splitting on Non-Word Characters

Choosing which characters cause tokenization is something which is going to be very use-case specific. For this purpose I've just gone with standard word characters as a default.

#### User Should be Able To Specify Additional Non-Seperator Characters

Given this specication for an actual project, I would not have made this assumption. See the YAGNI (You Aint Gonna Need It) programming principle.

However for this project I made this assumption largely to make the implementation a bit more interesting and to demonstrate
production-ready configuration patterns.

#### Word Normalization: Ignore Case

Whether case should be taken into account is going to be task specific. Any real life implementation would likely have
some configuration about what to do about case when comparing words. This is one of the things I've elected not to do
as I already have something demonstration configuration patterns.

#### Word Normalization: Not Locale Aware

For the purpose of this demonstration, I've not used locale aware localization. In practice that means using `String.toLowerCase()` instead of `String.toLocaleLowerCase()`.

Again, in lieu of requirements this decision is more because this is one of the things I'm not focussing on demonstrating here.

#### Support of Stdin

I've made the decision to support stdin as an input as well as files,
as this would be the more common way to use a word-count CLI in any *nix environment.

This is another one of those assumptions I would have validated with stake-holders first in
a real-world context.

### Implementation Notes

##### Linting and Styling

This project uses `ESLint` and `Prettier` for styling, combined with `Husky` and `lint-staged` to apply the rules automatically on commit.

##### Packaging

Packages are about ninety percent ready to be published. The remaining work would be to generate isolated, Dockerized builds
which only include the necesary compiled files.

I would also seriously consider whether any such CLI applications would benefit from a Docker image being published too.

I would usually do this in tandem with a CI build system such as Gitlab CI, combined with [Semantic Release](https://www.npmjs.com/package/semantic-release) to manage versioning.

##### CJS vs ESM

The `core` package publishes with both `cjs` and `esm` entry-points. I've found that while it's painful to set up when
publishing modules, it can simplify build streams significantly later down the line.

##### Documentation

Currently documentation is duplicated between the README files and Typescript definitions or CLI help text respectively. I don't currently have a good answer for this, and I'm unsure if there is one.