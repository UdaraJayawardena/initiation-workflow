const { SQS } = require('@aws-sdk/client-sqs');

const { Config } = require('../../../config');

const { Consumer } = require('sqs-consumer');

const { region } = Config.AWS_CONFIGS;

const sqs = new SQS({ region: region });

/**
 * Send message to sqs queue
 */
const sendMessage = async (messageData, queueUrl) => {
  const messageParams = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(messageData),
  };

  try {
    const data = await sqs.sendMessage(messageParams);
    console.log('sendMessage :', data);
  } catch (error) {
    console.error('SQS error:', error);
    throw error;
  }
};

/**
 * Create and return sqs consumer
 * @returns sqs consumer
 */
const getConsumer = (queueUrl, listenerTitle, handler) => {
  const consumer = Consumer.create({
    queueUrl: queueUrl,

    handleMessage: async (message) => {
      try {
        const messageBody = JSON.parse(message.Body);
        await handler(messageBody);
        sqs.deleteMessage({
          QueueUrl: queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        });
      } catch (err) {
        console.log(`SQS ${listenerTitle} error: `, err);
        throw err;
      }
    },
    sqs: sqs,
  });

  consumer.start();

  consumer.on(`${listenerTitle} error`, (err) => {
    console.error(err.message);
  });

  consumer.on(`${listenerTitle} processing_error`, (err) => {
    console.error(err.message);
  });

  return consumer;
};

module.exports = {
  sendMessage,
  getConsumer,
};
