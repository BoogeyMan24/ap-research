import fs from "fs";
import readline from "readline";
import csv from "csv-parser";
import { serializeRow } from './helper-functions.js';

let count = 0;
let uniqueComments = new Map();

let repos = [];

const fileWrite = fs.createWriteStream('./data/testing.txt', { flags: "a" });
fs.createReadStream('./data/repos-senti.csv')
	.pipe(csv())
	.on('data', async (row) => {
		if (count === 0) console.log(row);

		const posAvg = parseFloat(row.positivity/row.total);
		const negAvg = parseFloat(row.negativity/row.total);

		repos.push({
			negativity: negAvg,
			positivity: posAvg,
			stars: row.stars
		});

		uniqueComments.set(row.id);
		
		count++;
		if (count % 1_000 === 0) console.log("Progress: " + count);
	})
	.on('end', () => {
		console.log("------------------------------ Done! ------------------------------");
		console.log("Unique Comments: " + uniqueComments.size);

		fileWrite.write("POSITIVITY:\n");
		for (const repo of repos) {
			fileWrite.write(repo.positivity + "\n");
		}

		fileWrite.write("NEGATIVITY:\n");
		for (const repo of repos) {
			fileWrite.write(repo.negativity + "\n");
		}

		fileWrite.write("STARS:\n");
		for (const repo of repos) {
			fileWrite.write(repo.stars + "\n");
		}
	});