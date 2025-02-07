import fs from "fs";
import readline from "readline";
import csv from "csv-parser";


let topics = new Set();

fs.createReadStream('./data/repos.csv')
	.pipe(csv())
	.on('data', (row) => {
		count++;

		let repoTopics = JSON.parse(row.topics.replaceAll("'", "\""));
		
		for (let topic of repoTopics) {
			topics.add(topic);
		}
	})
	.on('end', () => {
		const fileWrite = fs.createWriteStream('./data/topics.csv', { flags: "a" });

		for (const topic of topics) {
			fileWrite.write(topic + "\n");
		}
	});