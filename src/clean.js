import fs from "fs";
import readline from "readline";
import csv from "csv-parser";
import { serializeRow } from './helper-functions.js';



let topics = new Set([
	"interview",
	"education",
	"career",
	"certification",
	"community",
	"roadmap",
	"tutorial",
	"curated",
	"list",
	"awesome",
	"tips",
	"intern",
	"resource",
	"job",
	"hunting",
	"trick",
	"pdf",
	"book",
	"template",
	"documentation",
	"crypto",
	"dinosaur"
]);

const fileWrite = fs.createWriteStream('./data/clean-repos.csv', { flags: "a" });
fs.createReadStream('./data/repos.csv')
	.pipe(csv())
	.on('data', (row) => {
		let repoTopics = JSON.parse(row.topics.replaceAll("'", "\""));
		
		let containesBannedWords = false;

		if (repoTopics.length == 0 || (repoTopics.length == 1 && repoTopics[0] == "")) {
			containesBannedWords = true;
		} else {
			for (let repoTopic of repoTopics) {
				for (let topic of topics) {
					if (repoTopic.includes(topic)) {
						containesBannedWords = true;
					}
				}
			}	
		}
		
		if (!containesBannedWords && row.has_issues == "true") {
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
		}
	})
	.on('end', () => {
		console.log("Done!");
	});

// const fileStream = fs.createReadStream('./data/repos.csv');


// const rl = readline.createInterface({
// 	input: fileStream,
// 	crlfDelay: Infinity
// });




// let count = 0;
// for await (const line of rl) {
// 	count++;

// 	if (count == 1) continue;

// 	let lineData = line.indexOf("\"[");
// 	console.log(lineData);
// 	// let topics = JSON.parse(lineData[14]);

	
// 	// console.log(topics)

// 	if (count > 10) {
// 		break;
// 	}
// }