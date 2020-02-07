const cfg = require('../config');
const client = require('twilio')(cfg.twilioAccountSid, cfg.twilioAuthToken);
const conversations = require('./conversations');
const { Conversation, PhoneNumber } = require('../db');

let conversation;

/**
 * @param {string} baseUrl
 * @return {Promise<Conversation>}
 */
async function getConversation(baseUrl) {
  if (!conversation) {
    conversation = await Conversation.get();
    let twilioConversation;
    if (conversation) {
      twilioConversation = await conversations.getConversation(
        client,
        conversation.sid
      );
    }

    if (!twilioConversation) {
      twilioConversation = await conversations.createConversation(
        client,
        '2 Way Masked SMS'
      );
      conversation = await new Conversation({
        sid: twilioConversation.sid,
      }).save();
    }
    const webhooks = await conversations.getConversationWebhooks(
      client,
      conversation.sid
    );
    await conversations.updateConversationWebhooks(
      client,
      conversation.sid,
      webhooks,
      baseUrl
    );
  }
  return conversation;
}

/**
 * Add a participant to the conversation and the phone number to the DB
 * @param {Conversation} conversation
 * @param {string} number
 * @param {number} expirationTime
 * @return {Promise<null|PhoneNumber>}
 */
async function addPhoneNumber(conversation, number, expirationTime) {
  // add a participant
  const phoneNumber = await PhoneNumber.getByNumber(number);
  if (!phoneNumber) {
    const participant = await conversations.addParticipant(
      client,
      conversation.sid,
      number
    );
    return new PhoneNumber({
      sid: participant.sid,
      conversation: conversation.sid,
      number: number,
      latestActivity: new Date(),
      expirationTime: expirationTime,
    }).save();
  }
  if (phoneNumber.conversation !== conversation.sid) {
    await conversations.removeParticipant(
      client,
      phoneNumber.conversation,
      phoneNumber.sid
    );
    const participant = await conversations.addParticipant(
      client,
      conversation.sid,
      number
    );
    phoneNumber.sid = participant.sid;
    phoneNumber.conversation = conversation.sid;
    phoneNumber.expirationTime = expirationTime;
    return await phoneNumber.save();
  }
  return null;
}

/**
 * Remove phone number from DB and Twilio participant
 * @param {PhoneNumber} phoneNumber
 */
async function removePhoneNumber(phoneNumber) {
  await conversations.removeParticipant(
    client,
    phoneNumber.conversation,
    phoneNumber.sid
  );
}

/**
 * Send a message to the number saying its session expired
 * @param {PhoneNumber} phoneNumber
 * @param {string} message
 * @return {Promise<void>}
 */
async function sendMessage(phoneNumber, message) {
  await client.api.messages.create({
    to: phoneNumber.number,
    from: cfg.twilioPhoneNumber,
    body: message,
  });
}

module.exports = {
  getConversation,
  addPhoneNumber,
  removePhoneNumber,
  sendMessage,
};
