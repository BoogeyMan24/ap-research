import fs from "fs";
import readline from "readline";
import csv from "csv-parser";
import { serializeRow } from './helper-functions.js';


fs.createReadStream('./data/comments.csv')
	.pipe(csv())
	.on('data', async (row) => {
		console.log(row);
	})
	.on('end', () => {
		console.log("Done!");
	});