import fs from "fs";
import readline from "readline";
import csv from "csv-parser";
import { serializeRow } from './helper-functions.js';



const fileWrite = fs.createWriteStream('./data/repos-en-quoted.csv', { flags: "a" });

const rl = readline.createInterface({
	input: fs.createReadStream('./data/repos-en.csv', { encoding: 'utf8' }),
	crlfDelay: Infinity
});

let count = 0;
rl.on('line', (line) => {
	count++;
	if (count == 1) return;

	const firstComma = line.indexOf(',');
	const startDescription = line.indexOf(',', firstComma + 1);
	const endDescription = line.indexOf(',https://github.com', startDescription + 1);

	console.log(firstComma, startDescription, endDescription);

	let description = line.slice(startDescription + 1, endDescription);

	let newDescription = description;

	if (description[0] == "\"") {
		newDescription = description.slice(1,-1);

		newDescription = "\"" + newDescription.replaceAll("\"", "'") + "\"";
	}

	fileWrite.write(line.slice(0, startDescription) + "," + newDescription + "," + line.slice(endDescription) + "\n");

	if (count % 100000 === 0) console.log(`Read ${count} rows`);
});

rl.on('close', () => console.log(`Finished. Total lines read: ${count}`));