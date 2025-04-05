import fs from "fs";
import csv from "csv-parser";


let languages = new Map();
let count = 0;

fs.createReadStream('./data/clean-repos.csv')
	.pipe(csv())
	.on('data', (row) => {
		count++;

		if (languages.has(row.language)) {
			languages.set(row.language, languages.get(row.language) + 1);
		} else {
			languages.set(row.language, 1);
		}
	})
	.on('end', () => {
		let highest = 0;
		let highestKey = "";

		for (const [key, value] of languages) {
			if (value > highest) {
				highestKey = key;
				highest = value;
			}
		}
		console.log(languages.get("BASH"));
		console.log(highestKey, highest);
	});