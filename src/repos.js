import './loadEnv.js';
import { Octokit, App } from "octokit";
import { convertArrayToCSV } from "convert-array-to-csv";
import fs from "fs";
import { serializeRow } from './helper-functions.js';

const octokit = new Octokit({ 
	auth: process.env.GITHUB_TOKEN
});

// had to over complicate the code to get around the 100 page limit BRUHHH


// const isEmptyValue = value =>
// 	value === null || value === undefined || Number.isNaN(value);
  
// const serializeValue = (value, delimiter = ',') => {
// 	if (isEmptyValue(value)) return '';
// 	if (Array.isArray(value)) {
// 		value = `"['${value.join("','")}']"`;

// 	} else {
// 		value = `${value}`;

// 		if (value.includes(delimiter) || value.includes('\n') || value.includes('"')) {
// 			return `"${value.replace(/"/g, '""').replace(/\n/g, '\\n')}"`;
// 		}
// 	}

// 	return value;
// };
  
// const serializeRow = (row, delimiter = ',') => row.map(value => serializeValue(value, delimiter)).join(delimiter);

// const header = ['name', 'description', 'url', 'created_at', 'update_at', 'owner_name', 'owner_url', 'owner_type', 'size', 'stars', 'forks', 'issues', 'watchers', 'language', 'topics', 'has_issues', 'has_projects', 'has_downloads', 'has_wiki', 'has_pages', 'has_discussions', 'issues_url', 'issues_comments_url', 'comments_url', 'pulls_url', 'discussions_url', 'default_branch', 'fork', 'template', 'archived', 'disabled'];

const totalCount = 221_654;
let count = 0;

let high = 500_000
let low = 26_000

var stream = fs.createWriteStream("./data/repos.csv", { flags: 'a' });

let ids = 0;

while (high >= 200) {
	let res = await octokit.request('GET /search/repositories', {
		headers: {
		  'X-GitHub-Api-Version': '2022-11-28'
		},
		q: `stars:${low}..${high}`,
		per_page: 100,
		page: 1,
		sort: "stars",
		order: "desc"
	});

	console.log(`Star range: ${low}..${high} (${res.data.total_count})`);

	if (res.data.total_count > 1000) {
		low += Math.ceil((high - low) / 2);
		continue;
	}

	console.log("Found!");
	
	let total = res.data.total_count;

	let time;
	for (let i = 1; i <= Math.ceil(total / 100); i++) {
		time = Date.now();

		let reposRes = await octokit.request('GET /search/repositories', {
			headers: {
			  'X-GitHub-Api-Version': '2022-11-28'
			},
			q: `stars:${low}..${high}`,
			per_page: 100,
			page: i,
			sort: "stars",
			order: "desc"
		});


		for (let repositoryData of reposRes.data.items) {
			// let repository = {
			// 	name: repositoryData.name,
			// 	description: repositoryData.description,
			// 	url: repositoryData.html_url,
			// 	created_at: repositoryData.created_at,
			// 	last_updated: repositoryData.updated_at,
			// 	owner_name: repositoryData.owner.login,
			// 	owner_url: repositoryData.owner.html_url,
			// 	owner_type: repositoryData.owner.type,
			// 	size: repositoryData.size,
			// 	stars: repositoryData.stargazers_count,
			// 	forks: repositoryData.forks_count,
			// 	issues: respositoryData.issues,
			// 	watchers: repositoryData.watchers,
			// 	language: repositoryData.language,
			// 	topics: repositoryData.topics,
			// 	has_issues: repositoryData.has_issues,
			// 	has_projects: repositoryData.has_projects,
			// 	has_downloads: repositoryData.has_downloads,
			// 	has_wiki: repositoryData.has_wiki,
			// 	has_pages: repositoryData.has_pages,
			// 	has_discussions: repositoryData.has_discussions,
			// 	issues_url: repositoryData.issues_url,
			//  issue_comments_url: repositoryData.issue_comment_url,
			//  comments_url: repositoryData.comments_url,
			// 	pulls_url: repositoryData.pulls_url,
			// 	discussions_url: repositoryData.discussions_url,
			// 	default_branch: repositoryData.default_branch,
			// 	fork: repositoryData.fork,
			//  template: repositoryData.is_template,
			// 	archived: repositoryData.archived,
			// 	disabled: repositoryData.disabled
			// }
			
			let repository = [
				id,
				repositoryData.name,
				repositoryData.description,
				repositoryData.html_url,
				repositoryData.created_at,
				repositoryData.updated_at,
				repositoryData.owner.login,
				repositoryData.owner.html_url,
				repositoryData.owner.type,
				repositoryData.size,
				repositoryData.stargazers_count,
				repositoryData.forks_count,
				repositoryData.open_issues,
				repositoryData.watchers,
				repositoryData.language,
				repositoryData.topics,
				repositoryData.has_issues,
				repositoryData.has_projects,
				repositoryData.has_downloads,
				repositoryData.has_wiki,
				repositoryData.has_pages,
				repositoryData.has_discussions,
				repositoryData.issues_url,
				repositoryData.issue_comment_url,
				repositoryData.comments_url,
				repositoryData.pulls_url,
				repositoryData.discussions_url,
				repositoryData.default_branch,
				repositoryData.fork,
				repositoryData.is_template,
				repositoryData.archived,
				repositoryData.disabled
			];

			ids++;
	
			stream.write(serializeRow(repository) + "\n");
		}

		count += reposRes.data.items.length;
		console.log(`${count} of ${totalCount} repos completed: ${(count / totalCount * 100).toFixed(2)}% (${Date.now() - time}ms)`);
	}

	console.log(`Star range complete: ${low}..${high}`);
	high = low - 1;
	low = Math.ceil(high * 0.95);

	console.log(`Searching for star range...`);
}