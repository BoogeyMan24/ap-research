import fs from "fs";
import { resolve } from "path";
import readline from "readline";

const fileWrite = fs.createWriteStream(`./data/comments-senti.tsv`, { flags: "a", highWaterMark: 1024 * 1024 });

let count = 0;

for (let i = 0; i < 33; i++) {
	const rl = readline.createInterface({
		input: fs.createReadStream(`./data/comment-chunks-senti/comments-${i}.tsv`, { encoding: 'utf8' }),
		crlfDelay: Infinity
	});
	
	await new Promise((resolve) => {
		rl.on('line', (line) => {
			if (fileWrite != null) {
				fileWrite.write(line + "\n");
			} else {
				console.log("fileWrite is somehow null!")
			}
	
			count++;
		});
		
		rl.on('close', () => {
			console.log(`Finished comments-${i}.tsv`);
			resolve();
		});		
	});
}

console.log(`Done! ${count} total lines.`);