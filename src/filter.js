import fs from "fs";
import readline from "readline";
import csv from "csv-parser";
import { serializeRow } from './helper-functions.js';

let count = 0;
let sentiment = new Map();
let uniqueComments = new Map();

let currentRepo = null;

// const fileWrite = fs.createWriteStream('./data/ids-repos.csv', { flags: "a" });
fs.createReadStream('./data/comments-senti.csv')
	.pipe(csv())
	.on('data', async (row) => {
		if (count === 0) console.log(row);
		if (row.user_type !== "Bot") {

			if (currentRepo !== row.repo_id) {
				currentRepo = row.repo_id;
			}

			if (sentiment.has(row.repo_id)) {
				sentiment.set(row.repo_id, {
					positivity: sentiment.get(row.repo_id).positivity + parseInt(row.positive),
					negativity: sentiment.get(row.repo_id).negativity + parseInt(row.negative),
					total: sentiment.get(row.repo_id).total + 1
				});
			} else {
				sentiment.set(row.repo_id, { 
					positivity: parseInt(row.positive),
					negativity: parseInt(row.negative),
					total: 1 
				});
			}
		}

		uniqueComments.set(row.node_id);
		
		count++;
		if (count % 100_000 === 0) console.log("Progress: " + count);
	})
	.on('end', () => {
		console.log("------------------------------ Done! ------------------------------");
		console.log("Unique Comments: " + uniqueComments.size);

	
		let n = 0.1;

		let bucketsPos = [];
		let bucketsNeg = [];


		// let countPos = 0;
		for (const [key, value] of sentiment) {
			// countPos++;
			// if (countPos > 10) break;

			// console.log("Positive Key, Positvity, Negativity, AveragePos, AverageNeg: " + key + ", " + value.positivity + ", " + value.negativity + ", " + (value.positivity/value.total) + ", " + (value.negativity/value.total));

			const posAvg = parseFloat(value.positivity/value.total);
			const negAvg = parseFloat(value.negativity/value.total);

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

		}

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