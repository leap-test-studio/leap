const { WebClient } = require("@slack/web-api");

async function sendSlackNotification(channel, text) {
    try {
        logger.trace(channel, text);
        if (global.config.SLACK_BOT_TOKEN) {
            const web = new WebClient(global.config.SLACK_BOT_TOKEN);
            await web.chat.postMessage({
                channel,
                text
            });
        }
    } catch (error) {
        logger.error(error);
    }
}

module.exports = {
    sendSlackNotification
};
