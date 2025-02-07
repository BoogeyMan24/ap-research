import './loadEnv.js';
import { Octokit, App } from "octokit";

const octokit = new Octokit({ 
	auth: process.env.GITHUB_TOKEN
});

let res = await octokit.request(`GET https://api.github.com/repos/facebook/react/issues/comments`, {
	headers: {
		'X-GitHub-Api-Version': '2022-11-28'
	},
	per_page: 1,
	page: 1,
});

console.log(res.headers['x-ratelimit-remaining']);