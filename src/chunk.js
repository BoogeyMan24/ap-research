import fs from "fs";
import readline from "readline";
import csv from "csv-parser";
import { serializeRow } from './helper-functions.js';


let fileWrite = null;

let rowCount = 0;
let skippedRows = 0;

const rl = readline.createInterface({
	input: fs.createReadStream('./data/comments.tsv', { encoding: 'utf8' }),
	crlfDelay: Infinity
});

let count = 0;
let first = true;
rl.on('line', (line) => {
	if (first) {
		first = false;
		return;
	}

	if (rowCount % 100000 === 0) {
		if (fileWrite != null) {
			fileWrite.end();
		}
		fileWrite = fs.createWriteStream(`./data/comment-chunks/comments-${Math.floor(rowCount / 100000)}.tsv`, { flags: "a", highWaterMark: 1024 * 1024 });
	}

	if (fileWrite != null) {
		fileWrite.write(line + "\n");
	} else {
		console.log("fileWrite is somehow null!")
	}
	

	rowCount++;
	if (rowCount % 100000 === 0) console.log(`Read ${rowCount} rows`);
});

rl.on('close', () => console.log(`Finished. Total rows read: ${rowCount}, Skipped: ${skippedRows}`));
