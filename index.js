const { getInput, setFailed } = require('@actions/core');
const { WebClient } = require('@slack/web-api');
const { readFileSync } = require('fs');

function parseTestResults(jsonPath) {
    const rawData = readFileSync(jsonPath, 'utf-8');
    const results = JSON.parse(rawData);
    const stats = results.stats || {};
    const total = stats.expected || 0;
    const passed = total - (stats.unexpected || 0);
    const failed = stats.unexpected || 0;
    const duration = Math.ceil(stats.duration / 1000) || 0;

    return {
        total,
        passed,
        failed,
        duration
    };
}

function getStatusEmoji(passed, total) {
    const ratio = passed / total;
    if (ratio === 1) return ':heavy_check_mark:'; 
    if (ratio > 0) return ':warning:';
    return ':x:';
}

async function run() {
    try {
        const title = getInput('title');
        const slackBotToken = getInput('slack-bot-token');
        const slackChannel = getInput('slack-channel');
        const jsonPath = getInput('json-path');

        const githubRepository = process.env.GITHUB_REPOSITORY;
        const githubRunId = process.env.GITHUB_RUN_ID;
        url = `https://github.com/${githubRepository}/actions/runs/${githubRunId}`;

        const { total, passed, failed, duration } = parseTestResults(jsonPath);
        const statusEmoji = getStatusEmoji(passed, total);
        let messageText = `${statusEmoji} *<${url}|${title}>*\n`;
        messageText += `Total: ${total}, Passed: ${passed}, Failed: ${failed}, Duration: ${duration}s\n`;


        const slack = new WebClient(slackBotToken);
        await slack.chat.postMessage({
            channel: slackChannel,
            text: messageText,
            mrkdwn: true,
        });

        console.log("Message sent to Slack successfully.");
    } catch (error) {
        console.error("Failed to process test results:", error);
        setFailed(error.message);
    }
}

run();