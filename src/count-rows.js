import fs from "fs";
import csv from "csv-parser";


let count = 0;
fs.createReadStream('./data/comments.csv')
	.pipe(csv())
	.on('data', async () => {
		count++;
		if (count % 100_000 === 0) console.log(`Proccessed ${count}`);
	})
	.on('end', () => {
		console.log(`Done! Final count: ${count}`);
	});