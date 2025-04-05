import fs from "fs";
import csv from "csv-parser";
import readline from "readline";

const fileWrite = fs.createWriteStream(`./data/repos-senti.csv`, { flags: "a", highWaterMark: 1024 * 1024 });

// let count = 0;
// let sentiment = new Map();
// let uniqueComments = new Map();


let count = 0;
let sentiment = new Map();
let uniqueComments = new Map();

let currentRepo = null;

// const fileWrite = fs.createWriteStream('./data/ids-repos.csv', { flags: "a" });
fs.createReadStream('./data/comments-senti.csv')
	.pipe(csv())
	.on('data', (row) => {
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

			uniqueComments.set(row.node_id);
		}

		
		count++;
		if (count % 100_000 === 0) console.log("Progress: " + count);
	})
	.on('end', () => {
		console.log("------- Done! ------");
		console.log("Total Progress: " + count);
		console.log("Unique Comments: " + uniqueComments.size);



		const rl = readline.createInterface({
			input: fs.createReadStream(`./data/repos-en.csv`, { encoding: 'utf8' }),
			crlfDelay: Infinity
		});

		console.log("set");

		let count2 = 0;
		let found = 0;
		rl.on('line', (line) => {
			if (count2 % 10_000 === 0) console.log("Progress Total:", count2);
			if (found % 1_000 === 0) console.log("Progress Found:", found);
			count2++;
			if (count2 !== 1) {
				const id = line.split(",")[0];
		
				if (sentiment.has(id)) {
					found++;
		
					const sentimentData = sentiment.get(id);

					fs.createReadStream('./data/repos-commented.csv')
						.pipe(csv())
						.on('data', (row) => {
							if (id === row.id) {

								if (row.comments_saved - row.comments_bots >= 100) {
									fileWrite.write(line + `,${sentimentData.positivity},${sentimentData.negativity},${sentimentData.total},${row.comments_bots},${row.comments_saved}\n`);
								}
							}
						})
				}
			}
		});
		
		rl.on('close', () => {
			console.log(`Done! ${found} total lines of ${count2}.`);
		});
	});
