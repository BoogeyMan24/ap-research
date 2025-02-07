import './loadEnv.js';
import { Octokit, App } from "octokit";
import { convertArrayToCSV } from "convert-array-to-csv";
import fs from "fs";
import { serializeRow } from './helper-functions.js';
import parse from 'parse-link-header';
import csv from "csv-parser";

function getRandomInteger(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}


const octokit = new Octokit({ 
	auth: process.env.GITHUB_TOKEN
});


// https://api.github.com/repos/facebook/react/comments

const commentsWrite = fs.createWriteStream('./data/comments.csv', { flags: "a" });
const reposCommentedWrite = fs.createWriteStream('./data/repos-commented.csv', { flags: "a" });


async function getUnvisited() {
	let unvisited = new Set();
	await new Promise((resolve, reject) => {
		fs.createReadStream('./data/clean-repos.csv')
			.pipe(csv())
			.on("data", async (row) => {
				unvisited.add(row.id);
			})
			.on("end", () => {
				fs.createReadStream('./data/repos-commented.csv')
					.pipe(csv())
					.on("data", async (row) => {
						unvisited.delete(row.id);
					})
					.on("end", () => {
						resolve(unvisited);
					});
			});
	});

	return unvisited;
}

let unvisitedSet = await getUnvisited();
let unvisitedArray = Array.from(unvisitedSet);

let count = 0;

for (let i = 0; i < unvisitedArray.length; i++) {

	if (count > 2) {
		break;
	}

	let randomRepoId = unvisitedArray[getRandomInteger(0, unvisitedArray.length)];


	let repoRow = await findRepoById(randomRepoId);

	if (repoRow != "") {
		getComments(repoRow);

		unvisitedSet.delete(randomRepoId);
		unvisitedArray = Array.from(unvisitedSet);
	
		
	} else {
		console.log("Failed to find repo with ID: " + randomRepoId);
	}
	

	count++;
}

async function findRepoById(repoId) {
	return new Promise((resolve, reject) => {
		let repoRow = "";

		fs.createReadStream('./data/clean-repos.csv')
			.pipe(csv())
			.on("data", async (row) => {
				if (row.id == repoId) {
					repoRow = row;
				}
			})
			.on("end", () => {
				resolve(repoRow);
			});
	});
}

async function getComments(row) {

	if (row.has_issues == "true") {

		let link = row.issues_comments_url.slice(22, -9);

		console.log("Starting search for: " + link);


		let resInit = await octokit.request(`GET ${link}`, {
			headers: {
			'X-GitHub-Api-Version': '2022-11-28'
			},
			per_page: 100,
			page: 1,
		});

		if ('link' in resInit.headers) {
			let parsed = parse(resInit.headers.link);
			let lastPage = parseInt(parsed.last.page);

			console.log("Number of pages: " + lastPage);

			let resLast = await octokit.request(`GET ${link}`, {
				headers: {
				'X-GitHub-Api-Version': '2022-11-28'
				},
				per_page: 100,
				page: lastPage,
			});

			let totalComments = resLast.data.length + (lastPage - 1) * 100;

			

			let zScore = 1.96
			let proportion = 0.5;
			let population = totalComments;
			let marginOfError = 0.05;
			let unlimitedSample = (zScore**2 * proportion * (1 - proportion)) / marginOfError**2;
			let limitedSample = Math.ceil(unlimitedSample / (1 + ((zScore**2 * proportion * (1 - proportion)) / (marginOfError**2 * population))));
			
			// console.log(totalComments);
			// console.log(resLast.headers['x-ratelimit-reset']);
			// console.log(limitedSample);


			let pageMap = {};

			let numOfComments = 0;

			while (numOfComments < limitedSample) {
				let randomComment = getRandomInteger(0, totalComments);
				let page = Math.ceil(randomComment / 100);
				let comment = randomComment % 100;

				if (pageMap[page]) {
					if (!(comment in pageMap[page])) {
						pageMap[page].add(comment);
						numOfComments++;
					} else {
						continue;
					}
					
				} else {
					pageMap[page] = new Set();
					pageMap[page].add(comment);
				}
			}

			console.log("Total comments, comments lottery: " + totalComments + ", " + numOfComments);


			let commentCount = 0;

			let comments = [];
			for (let page of Object.keys(pageMap)) {
				let resCommentsPage = await octokit.request(`GET ${link}`, {
					headers: {
					'X-GitHub-Api-Version': '2022-11-28'
					},
					per_page: 100,
					page: page,
				});

				for (let commentPos of pageMap[page]) {
					
					let commentData = resCommentsPage.data[commentPos];

					let comment = [
						row.id,
						row.name,
						commentData.id,
						commentData.node_id,
						commentData.html_url,
						commentData.author_association,
						commentData.body
					];

					comments.push(serializeRow(comment) + "\n");
				}
			}

			for (let comment of comments) {
				commentsWrite.write(comment);
			}

			reposCommentedWrite.write(row.id + "," + row.name + "," + row.issues_comments_url.slice(22, -9) + "," + numOfComments + "," + comments.length + "\n");
		} else {
			// Doesn't do pagination
			// Just save all comments
		}
	}
}