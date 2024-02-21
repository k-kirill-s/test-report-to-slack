import { getInput, setFailed } from '@actions/core';
import { WebClient } from '@slack/web-api';
import { readFileSync } from 'fs';

interface TestResult {
    total: number;
    passed: number;
    failed: number;
    duration: number;
}

function parseTestResults(jsonPath: string): TestResult {
    const rawData = readFileSync(jsonPath, 'utf-8');
    const results = JSON.parse(rawData);
    const stats = results.stats || {};
    const total = stats.expected || 0;
    const passed = total - (stats.unexpected || 0);
    const failed = stats.unexpected || 0;
    const duration = stats.duration || 0;

    return {
        total,
        passed,
        failed,
        duration
    };
}

async function run() {
    try {
        const jsonFilePath = getInput('jsonFilePath');
        const slackBotToken = getInput('slackbottoken');
        const slackChannel = getInput('slackchannel');
        const url = getInput('url', { required: false });

        const { total, passed, failed, duration } = parseTestResults(jsonFilePath);
        let messageText = `Test Results: Total: ${total}, Passed: ${passed}, Failed: ${failed}, Duration: ${duration}ms`;
        if (url) {
            messageText += ` | Details: ${url}`;
        }

        const slack = new WebClient(slackBotToken);
        await slack.chat.postMessage({
            channel: slackChannel,
            text: messageText,
        });

        console.log("Message sent to Slack successfully.");
    } catch (error) {
        console.error("Failed to process test results:", error);
        setFailed(error.message);
    }
}

run();