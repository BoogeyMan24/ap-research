import fs from "fs";
import csv from "csv-parser";

let count = 0;
let uniqueComments = new Map();

let total = 0;

fs.createReadStream("./data/repos-senti.csv")
	.pipe(csv())
	.on('data', async (row) => {
		if (count === 0) console.log(row);

		total += parseInt(row.total);

		uniqueComments.set(row.id);
		
		count++;
		if (count % 100_000 === 0) console.log("Progress: " + count);
	})
	.on('end', () => {
		console.log("------- Done! ------");
		console.log("Unique Repos: " + uniqueComments.size);

		console.log("Results: " + (total/uniqueComments.size));
	});