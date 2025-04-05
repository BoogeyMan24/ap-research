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

		if (row.user_type === "Bot") {
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

			uniqueComments.set(row.node_id);
		}
		
		count++;
		if (count % 100_000 === 0) console.log("Progress: " + count);
	})
	.on('end', () => {
		console.log("------- Done! ------");
		console.log("Unique Comments: " + uniqueComments.size);

		let countPos = 0;
		for (const [key, value] of sentiment) {
			countPos++;
			if (countPos > 10) break;

			console.log("Positive Key, Positvity, Negativity, AveragePos, AverageNeg: " + key + ", " + value.positivity + ", " + value.negativity + ", " + (value.positivity/value.total) + ", " + (value.negativity/value.total));
		}
	});