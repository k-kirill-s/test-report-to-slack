const { getInput, setFailed } = require('@actions/core');
const { WebClient } = require('@slack/web-api');
const { readFileSync } = require('fs');

function parseTestResults(jsonPath) {
    const rawData = readFileSync(jsonPath, 'utf-8');
    const results = JSON.parse(rawData);
    const stats = results.stats || {};
    const passed = stats.expected || 0;
    const failed = stats.unexpected || 0;
    const total = passed + failed;
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
    if (ratio === 1) return ':white_check_mark:'; 
    if (ratio > 0) return ':warning:';
    return ':x:';
}

function getUrl() {
    const githubRepository = process.env.GITHUB_REPOSITORY;
    const githubRunId = process.env.GITHUB_RUN_ID;

    return `https://github.com/${githubRepository}/actions/runs/${githubRunId}`;
}

function getTitle() {
    const workflowName = process.env.GITHUB_WORKFLOW;
    const runNumber = process.env.GITHUB_RUN_NUMBER;

    return `Test execution performed: ${workflowName} #${runNumber}`;
}

async function run() {
    try {
        const title = getInput('title') || getTitle();
        const url = getInput('url') || getUrl();
        const slackBotToken = getInput('slack-bot-token');
        const slackChannel = getInput('slack-channel');
        const jsonPath = getInput('json-path');

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