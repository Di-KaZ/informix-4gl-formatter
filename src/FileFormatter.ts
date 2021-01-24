import fs from 'fs'
import * as Path from 'path'
import { IndentMode, options } from './app'
import { COLORS, FORMATTED_EXT, Printer } from './Utils'

interface Tokens {
  EMPTY_LINE_OR_COMMENT: RegExp
  MULTI_LINE_COMMENT_OPEN: RegExp
  MULTI_LINE_COMMENT_CLOSE: RegExp
  // token that add indentation
  INCREMENT_STATEMENT: RegExp
  // token that remove indentation
  DECREMENT_STATEMENT: RegExp
  // token that reset indentation
  RESET_STATEMENT: RegExp
  // token that push a condition libl in stack
  PUSH_IF_STACK: RegExp
  // token that pop condition libl in stack
  POP_IF_STACK: RegExp
  PRINT_LIBL_STACK: RegExp
}

const TOKENS: Tokens = {
  EMPTY_LINE_OR_COMMENT: /^\s+$|^--.*$|^#.*$/m,
  MULTI_LINE_COMMENT_OPEN: /^{.*/,
  MULTI_LINE_COMMENT_CLOSE: /}.*/,
  INCREMENT_STATEMENT: /^MAIN\b|^IF\b|^ELSE\b|^CASE\b|^WHEN\b|^FOR\b|^FUNCTION\b|^WHILE\b|^FOREACH\b/i,
  DECREMENT_STATEMENT: /^ELSE\b|^END\b|^WHEN\b/i,
  RESET_STATEMENT: /^MAIN\b|^FUNCTION\b|^RECORD\b/i,
  PUSH_IF_STACK: /^IF\b/i,
  POP_IF_STACK: /^END IF\b/i,
  PRINT_LIBL_STACK: /^ELSE\b/i,
}

export class FileFormatter {
  private _file_name: string // original file name
  private _lines: string[] // original file lines

  private _out_file_path: string // path where to wirte formatted line
  private _out_file_lines: string[] // formatted lines

  private _current_line_index: number // current line that we are formatting
  private _indent_level: number // current indentation depth
  private _if_stack: string[] // trace stack if lib

  /**
   * Create a file instance
   * @param base_name
   * @param out_directory
   * @param indent_chars
   */
  public constructor(base_name: string) {
    this._file_name = base_name
    this._out_file_path = Path.resolve(options.output, base_name.replace(/\.[^/.]+$/, FORMATTED_EXT))
    this._lines = []
    this._current_line_index = 0
    this._out_file_lines = []
    this._indent_level = 0
    this._if_stack = []
  }

  /**
   * Set the lines contained in the file
   * @param lines
   */
  public setLines(lines: string[]): void {
    this._lines = lines
  }

  /**
   * Process line of the file one by one
   */
  public processLines(): void {
    const timer_Start = new Date().getTime()
    Printer.info(`Formatting file -> ${this._file_name}`)
    // tant qu'il y a des lignes a traité on s'en occupe
    while (this._current_line_index < this._lines.length) {
      this.processLine()
      this._current_line_index += 1
    }
    // print formatted lines in out file
    fs.writeFileSync(this._out_file_path, this._out_file_lines.join('\n'), { encoding: 'latin1' })
    Printer.info(
      `Done Formatting file ${COLORS.FGMAGENTA}${this._file_name}${COLORS.RESET} in ${COLORS.FGRED}${
        (new Date().getTime() - timer_Start) / 1000
      } seconds !${COLORS.RESET}`,
    )
  }

  private modeCondition(line: string): string {
    if (options.mode === IndentMode.MODE_CONDITION) {
      this._if_stack.push('  { ' + (line.length > 10 ? line.substr(3, 40) : line.slice(3)) + ' }')
    }
    return line
  }

  private modeNumber(line: string): string {
    if (options.mode === IndentMode.MODE_NUMBER) {
      this._if_stack.push(
        '  { ' +
          Array.from(Array(this._if_stack.length + 1).keys())
            .map((val) => val + 1)
            .join('.') +
          ' }',
      )
      return line + this._if_stack.slice(-1)[0]
    }
    return line
  }

  private modeLine(line: string): string {
    if (options.mode === IndentMode.MODE_LINE) {
      this._if_stack.push(`  { Match Line ${this._current_line_index + 1} }`)
      return line + this._if_stack.slice(-1)[0]
    }
    return line
  }

  private manageIfStack(line: string): string {
    if (TOKENS.PUSH_IF_STACK.test(line)) {
      line = this.modeCondition(line)
      line = this.modeNumber(line)
      line = this.modeLine(line)
    }
    if (TOKENS.PRINT_LIBL_STACK.test(line) && this._if_stack.length !== 0) {
      return line + this._if_stack.slice(-1)[0]
    }

    if (TOKENS.POP_IF_STACK.test(line) && this._if_stack.length !== 0) {
      return line + this._if_stack.pop()
    }
    return line
  }

  /**
   * format current line and prepare the next one
   * @returns
   */
  private processLine(): void {
    let line: string = this._lines[this._current_line_index]

    // if line is just empty or just a signle line comment print it
    if (TOKENS.EMPTY_LINE_OR_COMMENT.test(line)) {
      this._out_file_lines.push(options.indent.repeat(this._indent_level) + line.trimLeft())
      return
    }

    // if mutiline comment search for end of it /!\ do not manage charracter after the closing } (need to be on a newline) TODO
    if (TOKENS.MULTI_LINE_COMMENT_OPEN.test(line)) {
      while (TOKENS.MULTI_LINE_COMMENT_CLOSE.test(line) === false) {
        this._out_file_lines.push(line)
        this._current_line_index += 1
        line = this._lines[this._current_line_index]
      }
      this._out_file_lines.push(line)
      return
    }

    // if not empty or a comment //
    // delete before and after space to clean up indentation and search token from start of string
    line = line.trim()
    if (options.mode !== IndentMode.MODE_NONE) {
      line = this.manageIfStack(line)
    }

    // check if we have to decrement indentation
    if (TOKENS.DECREMENT_STATEMENT.test(line)) {
      this._indent_level > 0 ? (this._indent_level -= 1) : (this._indent_level = 0)
    }

    // or reset it
    if (TOKENS.RESET_STATEMENT.test(line)) {
      this._indent_level = 0
    }

    // TODO LABEL

    // output line with indentation
    this._out_file_lines.push(options.indent.repeat(this._indent_level) + line)

    // set indentation fo next line
    if (TOKENS.INCREMENT_STATEMENT.test(line)) {
      this._indent_level += 1
    }
  }
}
