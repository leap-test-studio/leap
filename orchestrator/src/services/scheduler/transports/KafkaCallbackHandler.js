const kafka = require("kafka-node");
const { HighLevelProducer } = kafka;
const IP = require("ip");

module.exports = async function (request) {
  try {
    const kafkaClient = new kafka.KafkaClient(global.config.kafka);

    kafkaClient.on("error", (error) => logger.error("Kafka client error:", error));
    kafkaClient.on("socket_error", (error) => logger.error("Kafka client socket_error:", error));

    const kafkaProducer = new HighLevelProducer(kafkaClient, {
      requireAcks: 1
    });

    const { topic, data } = request;
    const KafkaTopics = [
      {
        topic: topic,
        messages: JSON.stringify({
          event_time: Date.now(),
          source_ip: IP.address(),
          data
        })
      }
    ];
    kafkaProducer.send(KafkaTopics, (err, res) => {
      if (!err) {
        return Promise.resolve(res);
      }
      return Promise.reject(err);
    });
    kafkaProducer.on("error", function (err) {
      return Promise.reject(err);
    });
  } catch (error) {
    return Promise.reject(error);
  }
};
