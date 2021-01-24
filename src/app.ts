import minimist from 'minimist'
import { exit } from 'process'
import { FileOpener } from './FileOpener'
import { HELP } from './Utils'

export enum IndentMode {
  MODE_CONDITION = 'condition',
  MODE_NUMBER = 'number',
  MODE_NONE = 'none',
  MODE_LINE = 'line',
}
export let options

export default function app(): void {
  options = minimist(process.argv.slice(2), {
    default: {
      output: '.', // output path default current directory
      indent: '\t', // indent to use default "\t"
      mode: IndentMode.MODE_LINE, // indentMode to use default LINE
    },
    boolean: ['help'],
    string: ['file', 'directory', 'output', 'indent', 'mode'],
    alias: {
      help: 'h',
      file: 'f',
      directory: 'd',
      output: 'o',
      indent: 'i',
      mode: 'm',
    },
  }) // global easier to pass args to all the diferrent part

  // getting  commandlines arguments
  if (options.h) {
    console.info(HELP)
    exit(0)
  }
  // Not only one option or no option
  if ((options.f === undefined && options.d === undefined) || (options.f && options.d)) {
    console.info(HELP)
    exit(0)
  }

  // create Instance of FileOpener
  const formatter: FileOpener = new FileOpener()

  // format files
  formatter.format()
  exit(0)
}
