const Whiteboard = require("whiteboard-pubsub");

module.exports = async function (request) {
    try {
        const { topic, message } = request;
        return await Whiteboard.publish(topic, typeof message === "object" ? JSON.stringify(message) : message);
    } catch (error) {
        return Promise.reject(error);
    }
};
