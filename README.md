# JSON Test Results reporter to Slack Github Action
Reporting test results to Slack from Github Actions, if they formatted in JSON file. Works with JSON reports from Playwright, Jest, Mocha etc.

This action has next possible inputs:
- ```title``` & ```url```  are **optional** fields, which will be populated automatically, but you could rewrite them by your own data, simply adding them to action inputs.
- ```slack-bot-token``` - **required** field, token of Slack app which you created in admin panel, it requires ```chat:write``` permission
- ```slack-channel``` - **required** field, ID of Slack channel, could be found at the end of channel details page
- ```json-path``` - **required** field, path to JSON file, which your framework should generated before

So, to use this action please add next lines to your workflow/action:

```
- name: JSON test results reporter to Slack
  uses: k-kirill-s/test-report-to-slack@v0.3.1
  if: success() || failure()
    with:
      slack-bot-token: ${{ secrets.SLACK_BOT_TOKEN }}
      slack-channel: ${{ secrets.SLACK_CHANNEL_ID }}
      json-path: ./reports/test-result.json
```
