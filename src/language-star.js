import fs from "fs";
import csv from "csv-parser";

let count = 0;
let uniqueRepos = new Set();

let languageToStar = new Map();

const fileWrite = fs.createWriteStream(`./data/language-star.txt`, { flags: "a", highWaterMark: 1024 * 1024 });

const allowedLanguages = [
	"python", "javascript", "typescript", "go", "java",
	"c++", "c#", "c", "php", "rust", "shell", "swift", "kotlin"
  ];

fs.createReadStream("./data/clean-repos.csv")
	.pipe(csv())
	.on('data', async (row) => {
		if (count === 0) console.log(row);

		
		if (allowedLanguages.includes(row.language.toLowerCase()) && row.language !== "") {
			languageToStar.set(row.id, {
				stars: parseInt(row.stars),
				language: row.language
			});
		}

		uniqueRepos.add(row.id);
		
		count++;
		if (count % 100_000 === 0) console.log("Progress: " + count);
	})
	.on('end', () => {
		console.log("------- Done! ------");
		console.log("Unique Repos: " + uniqueRepos.size);


		for (const [_, object] of languageToStar.entries()) {
			fileWrite.write(`${object.language},${object.stars}\n`);
		}
	});