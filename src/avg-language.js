import fs from "fs";
import csv from "csv-parser";

let count = 0;
let uniqueRepos = new Set();

let languageToStar = new Map();

const fileWrite = fs.createWriteStream(`./data/language.txt`, { flags: "a", highWaterMark: 1024 * 1024 });

fs.createReadStream("./data/clean-repos.csv")
	.pipe(csv())
	.on('data', async (row) => {
		if (count === 0) console.log(row);

		if (!languageToStar.has(row.language)) {
			languageToStar.set(row.language, {
				stars: [parseInt(row.stars)],
				forks: [parseInt(row.forks)],
				count: 1,
				language: row.language
			});
		} else {
			const object = languageToStar.get(row.language);

			object.stars.push(parseInt(row.stars));
			object.forks.push(parseInt(row.forks));
			object.count += 1;
		}

		uniqueRepos.add(row.id);
		
		count++;
		if (count % 100_000 === 0) console.log("Progress: " + count);
	})
	.on('end', () => {
		console.log("------- Done! ------");
		console.log("Unique Repos: " + uniqueRepos.size);


		for (const [language, object] of languageToStar.entries()) {
			fileWrite.write(`${language},${object.stars.reduce((acc, value) => acc + value, 0)},${object.forks.reduce((acc, value) => acc + value, 0)},${object.stars.reduce((acc, value) => acc + value, 0)/object.count},${median(object.stars)},${object.count}\n`);
		}
	});


function median(values) { // array of numbers

	if (values.length === 0) {
		throw new Error('Input array is empty');
	}
	
	// Sorting values, preventing original array
	// from being mutated.
	values = [...values].sort((a, b) => a - b);
	
	const half = Math.floor(values.length / 2);
	
	return (values.length % 2
		? values[half]
		: (values[half - 1] + values[half]) / 2
	);
	
}