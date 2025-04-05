import fs from "fs";
import readline from "readline";

// File paths
const file1Path = './data/comments.csv';
const file2Path = './data/comments-senti.tsv';
const outputFilePath = './data/comments-senti.csv';

// Create read streams for both files
const file1Stream = fs.createReadStream(file1Path, 'utf-8');
const file2Stream = fs.createReadStream(file2Path, 'utf-8');
const outputStream = fs.createWriteStream(outputFilePath, 'utf-8');

// Read files line by line
const rl1 = readline.createInterface({ input: file1Stream });
const rl2 = readline.createInterface({ input: file2Stream });

let counter = 0;

async function processFiles() {
    const file1Iterator = rl1[Symbol.asyncIterator]();
    const file2Iterator = rl2[Symbol.asyncIterator]();

    try {
        while (true) {
            const [file1Result, file2Result] = await Promise.all([
                file1Iterator.next(),
                file2Iterator.next(),
            ]);

            if (file1Result.done || file2Result.done) break; // Stop when either file ends

            const line1 = file1Result.value || '';
            const line2 = file2Result.value || '';

            // Extract parts of the lines
            const sentimentData = line2.slice(-4).split(" ");

            // Write to the output file
            outputStream.write(line1 + "," + sentimentData[0] + "," + sentimentData[1] + "\n");

			counter++;

			if (counter % 100_000 === 0) console.log("Completed: " + counter);
        }
    } catch (error) {
        console.error('Error processing files:', error);
    } finally {
        outputStream.end();
        console.log('File processing complete. Total counter: ' + counter);
    }
}

processFiles();