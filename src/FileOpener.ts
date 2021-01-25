import fs from 'fs';
import * as Path from 'path';
import { options } from './app';
import { FileFormatter } from './FileFormatter';
import { COLORS, FORMATTED_EXT, Printer } from './Utils';

export class FileOpener {
	private EXTENTION = '.4gl';
	private _files: FileFormatter[];

	constructor() {
		this._files = [];

		// check if the output directory exist if not create it
		try {
			if (options.output) {
				if (!fs.existsSync(options.output)) {
					Printer.info(`Directory ${options.output} does not exist attemping to create it.`);
					fs.mkdirSync(options.output);
					Printer.info(`Directory ${options.output} created !`);
				}
			}
		} catch (e) {
			Printer.error(`Unable to create the folder ${options.output}. please verify the rights`);
		}

		// Single File
		if (options.f) {
			this.openFile(options.f);
		}

		// Whole Directory
		if (options.d) {
			this.openDirectory(options.d);
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
				.filter((filepath) => !filepath.endsWith(FORMATTED_EXT) && filepath.endsWith(this.EXTENTION));
			Printer.info(`Processing ${filespath.length} file(s) in Directory ${dirpath}.`);
			filespath.forEach((filepath) => this.openFile(Path.resolve(dirpath, filepath)));
		} catch (e) {
			Printer.error(`Unable to open ${dirpath} please verify that it exist`);
		}
	}

	/**
	 * open a file (only if he has .4gl extention)
	 * @param path
	 */
	openFile(path: string): void {
		try {
			const base_name = Path.basename(path);
			const file: FileFormatter = new FileFormatter(base_name);

			// read the file TODO async to permit use of mutilthread for larger file and directory
			file.setLines(fs.readFileSync(path, { encoding: 'latin1' }).split('\n'));

			// add it to the files to format
			this._files.push(file);
		} catch (e) {
			Printer.error(`Unable to open ${path} please verify that it exist`);
		}
	}

	/**
	 * Format all the loaded files
	 */
	format(): void {
		const start = new Date().getTime();

		this._files.forEach((file) => {
			file.processLines();
		});

		Printer.info(
			`${COLORS.FGGREEN}All DONE IN ${(new Date().getTime() - start) / 1000} seconds !${
				COLORS.RESET
			} File(s) are in ${COLORS.FGRED}${Path.basename(options.output)}${COLORS.RESET}`,
		);
	}
}
