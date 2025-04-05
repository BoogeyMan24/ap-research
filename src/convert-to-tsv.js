import fs from "fs";
import readline from "readline";
import csv from "csv-parser";
import { serializeRow } from './helper-functions.js';



const fileWrite = fs.createWriteStream('./data/comments.tsv', { flags: "a", highWaterMark: 1024 * 1024 });
let count = 0;

// const rl = readline.createInterface({
// 	input: fs.createReadStream('./data/comments.csv', { encoding: 'utf8' }),
// 	crlfDelay: Infinity
// });

// rl.on('line', (line) => {
// 	count++;
// 	if (count == 1) return;


// 	let body = line.split(",").splice(6).join(",");

// 	let newBody = body;

// 	if (body[0] == "\"") {
// 		newBody = body.slice(1,-1);

// 		newBody = "\"" + newBody.replaceAll("\"", "'") + "\"";
// 	}

// 	fileWrite.write(line.split(",").slice(0, 6).join(",") + "," + newBody + "\n");

// 	if (count % 100000 === 0) console.log(`Read ${count} rows`);
// });

// rl.on('close', () => console.log(`Finished. Total lines read: ${count}`));



// let rowCount = 0;
// let skippedRows = 0;

// fs.createReadStream('./data/comments.csv')
// 	.pipe(csv())
// 	.on('data', (row) => {
// 		rowCount++;
// 		if (rowCount % 100000 === 0) console.log(`Read ${rowCount} rows`);
// 	})
// 	.on('error', (err) => {
// 		skippedRows++;
// 		console.error(`Error parsing row ${rowCount + skippedRows}:`, err.message);
// 	})
// 	.on('end', () => console.log(`Finished. Total rows read: ${rowCount}, Skipped: ${skippedRows}`));



fs.createReadStream('./data/comments.csv')
	.pipe(csv())
	.on('data', async (row) => {
		await new Promise((resolve) => setImmediate(resolve));

		let comment = [
			row.repo_id,
			row.repo_name,
			row.commnet_id,
			row.node_id,
			row.html_url,
			row.author_association,
			row.user_type,
			row.body
		];

		fileWrite.write(serializeRow(comment, "\t") + "\n");

		count++;
		if (count % 100000 === 0) console.log(`Read ${count} rows`);
	})
	.on('end', () => {
		console.log("Done!");
		console.log(`Finished. Total rows read: ${count}`);
	});