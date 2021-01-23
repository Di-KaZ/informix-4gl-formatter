import fs from 'fs'
import minimist from 'minimist'
import * as Path from 'path'
import { IndentMode } from './app'
import { FileFormatter } from './FileFormatter'
import { COLORS, FORMATTED_EXT, Printer } from './Utils'

export class FileOpener {
  private EXTENTION = '.4gl'

  private _out_directory: string = Path.dirname('.')
  private _files: FileFormatter[]

  private _indent_chars = '\t'
  private _indent_mode: IndentMode = IndentMode.MODE_CONDITION

  constructor(options: minimist.ParsedArgs) {
    this._files = []

    // check if the output directory exist if not create it
    try {
      if (options.o) {
        this._out_directory = options.o
        if (!fs.existsSync(options.o)) {
          Printer.info(`Directory ${this._out_directory} does not exist attemping to create it.`)
          fs.mkdirSync(options.o)
          Printer.info(`Directory ${this._out_directory} created !`)
        }
      } else {
        this._out_directory = Path.dirname(this._out_directory)
      }
    } catch (e) {
      Printer.error(`Unable to create the folder ${this._out_directory}. please verify the rights`)
    }

    // set the indent to the one defined by the user
    if (options.i) {
      this._indent_chars = options.i
    }

    // set the indentMode defined by the user
    if (options.l) {
      this._indent_mode = options.l
    }

    // Single File
    if (options.f) {
      this._out_directory = options.o != undefined ? options.o : Path.dirname(options.f)
      this.openFile(options.f)
    }

    // Whole Directory
    if (options.d) {
      this.openDirectory(options.d)
    }
  }

  /**
   * open all the file in the directory (only the one with .4gl extention)
   * @param dirpath
   */
  openDirectory(dirpath: string): void {
    try {
      const filespath = fs
        .readdirSync(dirpath, { encoding: 'latin1' })
        .filter((filepath) => !filepath.endsWith(FORMATTED_EXT) && filepath.endsWith(this.EXTENTION))
      Printer.info(`Processing ${filespath.length} file(s) in Directory ${dirpath}.`)
      filespath.forEach((filepath) => this.openFile(Path.resolve(dirpath, filepath)))
    } catch (e) {
      Printer.error(`Unable to open ${dirpath} please verify that it exist`)
    }
  }

  /**
   * open a file (only if he has .4gl extention)
   * @param path
   */
  openFile(path: string): void {
    try {
      const base_name = Path.basename(path)
      const file: FileFormatter = new FileFormatter(
        base_name,
        this._out_directory,
        this._indent_chars,
        this._indent_mode,
      )

      // read the file TODO async to permit use of mutilthread for larger file and directory
      file.setLines(fs.readFileSync(path, { encoding: 'latin1' }).split('\n'))

      // add it to the files to format
      this._files.push(file)
    } catch (e) {
      Printer.error(`Unable to open ${path} please verify that it exist`)
    }
  }

  /**
   * Format all the loaded files
   */
  format(): void {
    const start = new Date().getTime()

    this._files.forEach((file) => {
      file.processLines()
    })

    Printer.info(
      `${COLORS.FGGREEN}All DONE IN ${(new Date().getTime() - start) / 1000} seconds !${COLORS.RESET} File(s) are in ${
        COLORS.FGRED
      }${Path.basename(this._out_directory)}${COLORS.RESET}`,
    )
  }
}
