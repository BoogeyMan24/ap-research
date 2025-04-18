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

let ratelimit = 0;
let ratelimitReset = 0;

const MAX_RETRIES = 3;
const INITIAL_DELAY = 5000;

// https://api.github.com/repos/facebook/react/comments

const commentsWrite = fs.createWriteStream('./data/comments.csv', { flags: "a" });
const reposCommentedWrite = fs.createWriteStream('./data/repos-commented.csv', { flags: "a" });

let commentCount = 0;
let commentTotal = 0;
let commentBots = 0;
let repoId = "";
let gettingComments = false;

let start = Date.now();
let completed = 0;


setInterval(progress, 1 * 1000); // every second

async function getUnvisited() {
	let unvisited = new Set();
	await new Promise((resolve, reject) => {
		fs.createReadStream('./data/repos-en.csv')
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

let repoMap = new Map();
let counter = 0;

let unvisitedSet = await getUnvisited();
let unvisitedArray = Array.from(unvisitedSet);

let count = 0;


const errorsWrite = fs.createWriteStream('./data/errors.txt', { flags: "a" });
for (let i = 0; i < unvisitedArray.length; i++) {
	let randomRepoId = unvisitedArray[getRandomInteger(0, unvisitedArray.length)];

	let repoRow = await findRepoById(randomRepoId);
	repoId = repoRow.id;

	if (repoRow != "") {
		try {
			await getComments(repoRow);

			unvisitedSet.delete(randomRepoId);
			unvisitedArray = Array.from(unvisitedSet);
		} catch (e) {
			console.log(e);

			errorsWrite.write(randomRepoId + ": " + e + "\n")

			await new Promise((resolve) => { setTimeout(() => { resolve() }, 60 * 1000) });
		}

		commentCount = 0;
		commentTotal = 0;
		commentBots = 0;
	} else {
		console.log("Failed to find repo with ID: " + randomRepoId);
	}
	
	count++;
}

async function findRepoById(repoId) {
	if (repoMap.size == 0) {
		await new Promise((resolve) => {
			fs.createReadStream('./data/repos-en.csv')
				.pipe(csv())
				.on("data", async (row) => {
					repoMap.set(row.id, row);
					
					counter++;
					if (counter % 5000 == 0) console.log(`Loaded ${counter} repos.`);
				})
				.on("end", () => {
					console.log(`Loaded ${counter} total repos.`);
					resolve();
				});
		});
	}
	return repoMap.get(repoId);
}


async function getComments(row) {
	return new Promise(async (resolve, reject) => {

		if (row.has_issues == "true") {

			let link = row.issues_comments_url.slice(22, -9);
	
			console.log(`Starting search for (${repoId}): ${link}`);
	
			let resInit = await octokit.request(`GET ${link}`, {
				headers: {
				'X-GitHub-Api-Version': '2022-11-28'
				},
				per_page: 100,
				page: 1,
			});
	
			if (!('link' in resInit.headers)) {

				let comments = [];
				let commentsData = resInit.data;

				commentTotal = commentsData.length;

				gettingComments = true;

				progress();
				
				for (let i = 0; i < commentsData.length; i++) {

					let commentData = commentsData[i];

					let comment = [
						row.id,
						row.name,
						commentData.id,
						commentData.node_id,
						commentData.html_url,
						commentData.author_association,
						commentData.user.type,
						commentData.body
					];

					if (commentData.user.type == "Bot") {
						commentBots++;
					}

					comments.push(serializeRow(comment) + "\n");
					commentCount++;
				}

				for (let comment of comments) {
					commentsWrite.write(comment);
				}

				reposCommentedWrite.write(row.id + "," + row.name + "," + row.issues_comments_url.slice(22, -9) + "," + resInit.data.length + "," + commentBots + "," + comments.length + "\n");

				progress();

				console.log(`Complete! Adding repo (${row.id}) to commented/visited`);
				completed++;
	
				gettingComments = false;

			} else {
				let parsed = parse(resInit.headers.link);
				let lastPage = parseInt(parsed.last.page);
	
				console.log("Number of pages: " + lastPage);

				if (lastPage == 2) {
					let resTwo = await octokit.request(`GET ${link}`, {
						headers: {
						'X-GitHub-Api-Version': '2022-11-28'
						},
						per_page: 100,
						page: lastPage,
					});

					let comments = [];
					let commentsData = [...resInit.data, ...resTwo.data];
	
					commentTotal = commentsData.length;
	
					gettingComments = true;
	
					progress();
					
					for (let i = 0; i < commentsData.length; i++) {
	
						let commentData = commentsData[i];
	
						let comment = [
							row.id,
							row.name,
							commentData.id,
							commentData.node_id,
							commentData.html_url,
							commentData.author_association,
							commentData.user.type,
							commentData.body
						];

						if (commentData.user.type == "Bot") {
							commentBots++;
						}
	
						comments.push(serializeRow(comment) + "\n");
						commentCount++;
					}
	
					for (let comment of comments) {
						commentsWrite.write(comment);
					}
	
					reposCommentedWrite.write(row.id + "," + row.name + "," + row.issues_comments_url.slice(22, -9) + "," + (resInit.data.length + resTwo.data.length) + "," + commentBots + "," + comments.length + "\n");
	
					progress();
	
					console.log(`Complete! Adding repo (${row.id}) to commented/visited`);
					completed++;
		
					gettingComments = false;
				} else if (lastPage == 3) {
					let resTwo = await octokit.request(`GET ${link}`, {
						headers: {
						'X-GitHub-Api-Version': '2022-11-28'
						},
						per_page: 100,
						page: 2,
					});

					let resThree = await octokit.request(`GET ${link}`, {
						headers: {
						'X-GitHub-Api-Version': '2022-11-28'
						},
						per_page: 100,
						page: lastPage,
					});

					let comments = [];
					let commentsData = [...resInit.data, ...resTwo.data, ...resThree.data];
	
					commentTotal = commentsData.length;
	
					gettingComments = true;
	
					progress();
					
					for (let i = 0; i < commentsData.length; i++) {
	
						let commentData = commentsData[i];
	
						let comment = [
							row.id,
							row.name,
							commentData.id,
							commentData.node_id,
							commentData.html_url,
							commentData.author_association,
							commentData.user.type,
							commentData.body
						];

						if (commentData.user.type == "Bot") {
							commentBots++;
						}
	
						comments.push(serializeRow(comment) + "\n");
						commentCount++;
					}
	
					for (let comment of comments) {
						commentsWrite.write(comment);
					}
	
					reposCommentedWrite.write(row.id + "," + row.name + "," + row.issues_comments_url.slice(22, -9) + "," + (resInit.data.length + resTwo.data.length + resThree.data.length) + "," + commentBots + "," + comments.length + "\n");
	
					progress();
	
					console.log(`Complete! Adding repo (${row.id}) to commented/visited`);
					completed++;
		
					gettingComments = false;
				} else if (lastPage == 4) {
					let resTwo = await octokit.request(`GET ${link}`, {
						headers: {
						'X-GitHub-Api-Version': '2022-11-28'
						},
						per_page: 100,
						page: 2,
					});

					let resThree = await octokit.request(`GET ${link}`, {
						headers: {
						'X-GitHub-Api-Version': '2022-11-28'
						},
						per_page: 100,
						page: 3,
					});

					let resFour = await octokit.request(`GET ${link}`, {
						headers: {
						'X-GitHub-Api-Version': '2022-11-28'
						},
						per_page: 100,
						page: lastPage,
					});

					let comments = [];
					let commentsData = [...resInit.data, ...resTwo.data, ...resThree.data, ...resFour.data];
	
					commentTotal = commentsData.length;
	
					gettingComments = true;
	
					progress();
					
					for (let i = 0; i < commentsData.length; i++) {
	
						let commentData = commentsData[i];
	
						let comment = [
							row.id,
							row.name,
							commentData.id,
							commentData.node_id,
							commentData.html_url,
							commentData.author_association,
							commentData.user.type,
							commentData.body
						];

						if (commentData.user.type == "Bot") {
							commentBots++;
						}
	
						comments.push(serializeRow(comment) + "\n");
						commentCount++;
					}
	
					for (let comment of comments) {
						commentsWrite.write(comment);
					}
	
					reposCommentedWrite.write(row.id + "," + row.name + "," + row.issues_comments_url.slice(22, -9) + "," + (resInit.data.length + resTwo.data.length + resThree.data.length + resFour.data.length) + "," + commentBots + "," + comments.length + "\n");
	
					progress();
	
					console.log(`Complete! Adding repo (${row.id}) to commented/visited`);
					completed++;
		
					gettingComments = false;
				} else if (lastPage == 5) {
					let resTwo = await octokit.request(`GET ${link}`, {
						headers: {
						'X-GitHub-Api-Version': '2022-11-28'
						},
						per_page: 100,
						page: 2,
					});

					let resThree = await octokit.request(`GET ${link}`, {
						headers: {
						'X-GitHub-Api-Version': '2022-11-28'
						},
						per_page: 100,
						page: 3,
					});

					let resFour = await octokit.request(`GET ${link}`, {
						headers: {
						'X-GitHub-Api-Version': '2022-11-28'
						},
						per_page: 100,
						page: 4,
					});

					let resFive = await octokit.request(`GET ${link}`, {
						headers: {
						'X-GitHub-Api-Version': '2022-11-28'
						},
						per_page: 100,
						page: lastPage,
					});

					let comments = [];
					let commentsData = [...resInit.data, ...resTwo.data, ...resThree.data, ...resFour.data, ...resFive.data];
	
					commentTotal = commentsData.length;
	
					gettingComments = true;
	
					progress();
					
					for (let i = 0; i < commentsData.length; i++) {
	
						let commentData = commentsData[i];
	
						let comment = [
							row.id,
							row.name,
							commentData.id,
							commentData.node_id,
							commentData.html_url,
							commentData.author_association,
							commentData.user.type,
							commentData.body
						];

						if (commentData.user.type == "Bot") {
							commentBots++;
						}
	
						comments.push(serializeRow(comment) + "\n");
						commentCount++;
					}
	
					for (let comment of comments) {
						commentsWrite.write(comment);
					}
	
					reposCommentedWrite.write(row.id + "," + row.name + "," + row.issues_comments_url.slice(22, -9) + "," + (resInit.data.length + resTwo.data.length + resThree.data.length + resFour.data.length + resFive.data.length) + "," + commentBots + "," + comments.length + "\n");
	
					progress();
	
					console.log(`Complete! Adding repo (${row.id}) to commented/visited`);
					completed++;
		
					gettingComments = false;
				} else  {
					let resLast = await octokit.request(`GET ${link}`, {
						headers: {
						'X-GitHub-Api-Version': '2022-11-28'
						},
						per_page: 100,
						page: lastPage,
					});
		
					let totalComments = resLast.data.length + (lastPage - 1) * 100;
		

					// let zScore = 1.96
					// let proportion = 0.5;
					// let population = totalComments;
					// let marginOfError = 0.05;
					// let unlimitedSample = (zScore**2 * proportion * (1 - proportion)) / marginOfError**2;
					// let limitedSample = Math.ceil(unlimitedSample / (1 + ((zScore**2 * proportion * (1 - proportion)) / (marginOfError**2 * population))));
	
		
					let pageMap = {};
		
					let numOfComments = 0;
		
					while (numOfComments < 500) {
						let randomComment = getRandomInteger(0, totalComments);
						let page = Math.ceil(randomComment / 100);
						let comment = randomComment % 100;
		
						if (pageMap[page]) {
							if (!pageMap[page].has(comment)) {
								pageMap[page].add(comment);
								numOfComments++;
							} else {
								continue;
							}
							
						} else {
							pageMap[page] = new Set();
							pageMap[page].add(comment);
							numOfComments++;
						}
					}
		
					console.log(`Total comments (${totalComments})  Required comments (${500})  Comments lottery (${numOfComments}): ${(numOfComments/500 * 100).toFixed(2)}%`);
					gettingComments = true;
					
					
					commentTotal = numOfComments;
					commentCount = 0;
		
					let comments = [];
	
					for (let page of Object.keys(pageMap)) {
						let resCommentsPage = null;

						let attempts = 0;
						let gotData = false;
						while (attempts < MAX_RETRIES && !gotData) {
							try {
								resCommentsPage = await octokit.request(`GET ${link}`, {
									headers: {
									'X-GitHub-Api-Version': '2022-11-28'
									},
									per_page: 100,
									page: page,
								});

								gotData = true;
							} catch (e) {
								console.log(`(${repoId}) Failed to get comments! Attempt: ${attempts} on page ${page}.`);
								attempts++;
								const delay = INITIAL_DELAY * Math.pow(2, attempts);
								await new Promise(resolve => setTimeout(resolve, delay));
							}
						}
						

						if (resCommentsPage == null) {
							console.log(`(${repoId}) Failed to retry comments!`);
							reject(`(${repoId}) Failed to retry comments!`);
							return;
						}
	
						ratelimit = resCommentsPage.headers['x-ratelimit-remaining'];
						ratelimitReset = resCommentsPage.headers['x-ratelimit-reset'];
	
						for (let commentPos of pageMap[page]) {
	
							let commentData = resCommentsPage.data[commentPos];
		
							let comment = [
								row.id,
								row.name,
								commentData.id,
								commentData.node_id,
								commentData.html_url,
								commentData.author_association,
								commentData.user.type,
								commentData.body
							];

							if (commentData.user.type == "Bot") {
								commentBots++;
							}
		
							comments.push(serializeRow(comment) + "\n");
							commentCount++;
						}
					}
		
					for (let comment of comments) {
						commentsWrite.write(comment);
					}
		
					reposCommentedWrite.write(row.id + "," + row.name + "," + row.issues_comments_url.slice(22, -9) + "," + numOfComments + "," + commentBots + "," + comments.length + "\n");
	
					progress();
	
					console.log(`Complete! Adding repo (${row.id}) to commented/visited`);
					completed++;
		
					gettingComments = false;
				}
			}

			
			console.log(`Ratelimit: ${ratelimit} / ${((ratelimitReset - (Date.now()/1000))/60).toFixed(2)} minutes`);

			progressEstimate();
			resolve();
		}
	});
}

function progress() {
	if (gettingComments) {
		console.log(`(${repoId}) Collected ${commentCount} comments of ${commentTotal}: ${(commentCount / commentTotal * 100).toFixed(2)}%`);
	}
}

function progressEstimate() {
	console.log(`Average time spent on repo: ${((Date.now() - start)/1000/completed).toFixed(2)}s`);
}


// 215006
// 41908
// 12218
// 3003
