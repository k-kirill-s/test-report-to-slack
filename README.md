# JSON Test Report to Slack action
Reporting test results to Slack from Github Actions, if they formatted in JSON file. Works with JSON reports from Playwright, Jest, Mocha etc.

To use this action please add next lines to your workflow/action:

```
- name: JSON test results reporter to Slack
  uses: kirill-kaluga/test-report-to-slack@v0.3.0
  if: success() || failure()
    with:
      slack-bot-token: ${{ secrets.SLACK_BOT_TOKEN }}
      slack-channel: ${{ secrets.SLACH_CHANNEL_ID }}
      json-path: ./reports/test-result.json
```

Also ```title``` and ```url``` fields are populating automatically, but you could rewrite them by your own data, simply adding them to action inputs.