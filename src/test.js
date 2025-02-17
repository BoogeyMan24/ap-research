import LanguageDetect from 'languagedetect';
const lngDetector = new LanguageDetect();

console.log(lngDetector.detect('This is a test.', 3));
console.log(lngDetector.detect("@HeinrichApfelmus \n\n> Am I correct in assuming that once you were past the initial hurdles (opening Test.hhs and changing the stack.yaml path), evaluating expressions worked normally?\n\nIt did -- `reverse 'Hello!'` followed by Ctrl+Enter makes `'!olleH'` show up as expected.\n\n> This may also be a platform convention mismatch. On macOS, whenever you start an application, it need not open any window. It is fine to just populate the global menu bar and wait for the user to do something with it. What is the convention on Linux? Should I open a new, unsaved document?\n\nYes, I think so. Not all programs do that (some open a blank, document-less window, while others ask the user what they want to do), but opening a new unsaved worksheet would be entirely unsurprising and comfortable behaviour.\n", 3));
console.log(lngDetector.detect("Haha oh wow. Okay, here's a few things you can try (from the `alfred-jira` directory):\r\n```\r\nnode -e 'require('./lib/jira/keychain').delete();'\r\ntest -d ~/.alfred-jira && rm -rf ~/.alfred-jira\r\ncd ..\r\nrm -rf alfred-jira\r\ngit clone git@github.com:steyep/alfred-jira.git ./alfred-jira && cd $_\r\nnpm run build\r\nnpm update\r\n```\r\nIf you're still unable to log in:\r\n```\r\ncat > ~/.alfred-jira/env <<-EOF\r\nnode='$(which node)'\r\nnpm='$(which npm)'\r\nEOF\r\nsed -i'bak' -E 's_const PATH.*_const PATH = 'source ' + require('./jira/config').cfgPath + 'env;';_' lib/alfred-exec.js\r\n```\r\nIf that _still_ doesn't work, you can try to manually login:\r\n```\r\nsed -i'bak' -E '43,43d' app/main.js\r\nnpm run electron login\r\n```\r\nHopefully one of those options will work for you. Let me know!", 3));
console.log(lngDetector.detect('datart不用自己在建立一套独立的组织和权限，而是应该交给使用方的系统，只有能datart适配就可了，除非datart定义的是独立完整系统，不过这样和市面的BI产品没有啥区别', 3));

// https://github.com/Burton2000/CS231n-2017/pull/15#issuecomment-1332231089

import './loadEnv.js';
import { Octokit, App } from "octokit";

const octokit = new Octokit({ 
	auth: process.env.GITHUB_TOKEN
});

let res = await octokit.request(`GET https://api.github.com/repos/Burton2000/CS231n-2017/issues/comments/1332231089`, {
	headers: {
		'X-GitHub-Api-Version': '2022-11-28'
	},
	// per_page: 1,
	// page: 1,
});

console.log(res);