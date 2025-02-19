// https://github.com/Burton2000/CS231n-2017/pull/15#issuecomment-1332231089

import './loadEnv.js';
import { Octokit, App } from "octokit";

const octokit = new Octokit({ 
	auth: process.env.GITHUB_TOKEN
});

let res = await octokit.request(`GET https://api.github.com/repos/facebook/react/issues/comments`, {
	headers: {
		'X-GitHub-Api-Version': '2022-11-28'
	},
	per_page: 100,
	page: 301,
});

console.log(res);