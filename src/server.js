import { Octokit, App } from "octokit";
require('dotenv').config()

const octokit = new Octokit({ 
	auth: process.env.GITHUB_TOKEN
});


let res = await octokit.request('GET /search/repositories', {
	headers: {
	  'X-GitHub-Api-Version': '2022-11-28'
	},
	q: "stars:>=200",
	per_page: 100,
	sort: "stars",
	order: "desc"
});


console.log(res);