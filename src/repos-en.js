import fs from "fs";
// import readline from "readline";
import csv from "csv-parser";
import { serializeRow } from './helper-functions.js';
// import { pipeline } from 'stream/promises';
// import langcheck from "langcheck";
// import isEnglish from "is-english";
// import LanguageDetect from 'languagedetect';
// const lngDetector = new LanguageDetect();

// console.log(eld.detect('Hola, cómo te llamas?').language)


// async function processCSV() {
// 	const stream = fs.createReadStream('./data/repos.csv').pipe(csv());
  
// 	for await (const row of stream) {
// 		console.log(row.name + "\t" + row.description);
	
// 		// let language = (await langcheck(row.description));
// 		console.log("Is Chinese: " + /[\u3400-\u9FBF]/.test(row.description));
// 	}
// }

// await processCSV(); // Call the async function
// console.log("Finished processing CSV!");


let count = 0;
const fileWrite = fs.createWriteStream('./data/repos-en.csv', { flags: "a" });
fs.createReadStream('./data/clean-repos.csv')
	.pipe(csv())
	.on('data', async (row) => {
		if (/[\u0400-\u04FF\u3400-\u9FBF\u3131-\uD79D一-龯ぁ-んァ-ン]/.test(row.description)) return;

		let repository = [
			row.id,
			row.name,
			row.description,
			row.url,
			row.created_at,
			row.updated_at,
			row.owner_name,
			row.owner_url,
			row.owner_type,
			row.size,
			row.stars,
			row.forks,
			row.issues,
			row.watchers,
			row.language,
			row.topics,
			row.has_issues,
			row.has_projects,
			row.has_downloads,
			row.has_wiki,
			row.has_pages,
			row.has_discussions,
			row.issues_url,
			row.issues_comments_url,
			row.comments_url,
			row.pulls_url,
			row.discussions_url,
			row.default_branch,
			row.fork,
			row.template,
			row.archived,
			row.disabled
		];
	
		fileWrite.write(serializeRow(repository) + "\n");
		count++;

		if (count % 100_000 == 0) console.log(`Completed ${count} rows...`);
	})
	.on('end', () => {
		console.log(`Completed a total of ${count} rows!`) 
	});