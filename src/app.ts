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
// TODO adapt it to minimist interface, here just to know what arguments do
export interface Options {
  f?: string // open signle file (path)
  d?: string // open whole directory (path)
  o?: string // output path default current directory
  h?: string // help
  i?: string // indent to use default "\t"
  l?: IndentMode // indentMode to use default CONDITION
}

export default function app(): void {
  // getting  commandlines arguments
  const options = minimist(process.argv.slice(2))

  if (options.h) {
    console.info(HELP)
    exit(0)
  }
  // Not only one option or no option
  if ((options.f && options.d) || (!options.f && !options.d)) {
    console.info(HELP)
    exit(0)
  }

  // create Instance of FileOpener
  const formatter: FileOpener = new FileOpener(options)

  // format files
  formatter.format()
  exit(0)
}
