import fs from "fs";
import readline from "readline";
import csv from "csv-parser";
import { serializeRow } from './helper-functions.js';

let count = 0;
let sentiment = new Map();
let uniqueComments = new Map();


let n = 0.05;

let bucketsPos = [];
let bucketsNeg = [];

// const fileWrite = fs.createWriteStream('./data/ids-repos.csv', { flags: "a" });
fs.createReadStream('./data/repos-senti.csv')
	.pipe(csv())
	.on('data', async (row) => {
		if (count === 0) console.log(row);

		const posAvg = parseFloat(row.positivity/row.total);
		const negAvg = parseFloat(row.negativity/row.total);

		const posValue = bucketsPos[Math.floor((posAvg - 1)/n)];
		if (posValue) {
			bucketsPos[Math.floor((posAvg - 1)/n)] = posValue + 1;
		} else {
			bucketsPos[Math.floor((posAvg - 1)/n)] = 1;
		}

		const negValue = bucketsNeg[Math.floor(Math.abs((negAvg + 1)/n))];
		if (negValue) {
			bucketsNeg[Math.floor(Math.abs((negAvg + 1)/n))] = negValue + 1;
		} else {
			bucketsNeg[Math.floor(Math.abs((negAvg + 1)/n))] = 1;
		}

		uniqueComments.set(row.id);
		
		count++;
		if (count % 1_000 === 0) console.log("Progress: " + count);
	})
	.on('end', () => {
		console.log("------------------------------ Done! ------------------------------");
		console.log("Unique Comments: " + uniqueComments.size);

		console.log("POSTIVE")
		let positiveValues = "";
		for (const val of bucketsPos) {
			const freq = val ?? 0;

			positiveValues = positiveValues + freq + "\n";			
		}
		console.log(positiveValues);

		console.log("NEGATIVE")
		let negativeValues = "";
		for (const val of bucketsNeg) {
			const freq = val ?? 0;

			negativeValues = negativeValues + freq + "\n";			
		}
		console.log(negativeValues);
	});