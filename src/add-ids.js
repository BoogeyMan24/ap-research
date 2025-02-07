import fs from "fs";
import readline from "readline";
import csv from "csv-parser";
import { serializeRow } from './helper-functions.js';


let ids = 0;


const fileWrite = fs.createWriteStream('./data/ids-repos.csv', { flags: "a" });
fs.createReadStream('./data/repos.csv')
	.pipe(csv())
	.on('data', async (row) => {

		if (ids < 1_000_000) {
			let repository = [
				ids,
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

		ids++;
	})
	.on('end', () => {
		console.log("Done!");
	});