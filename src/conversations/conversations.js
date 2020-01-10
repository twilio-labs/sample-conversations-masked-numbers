'use strict';

const cfg = require('../config');

/**
 * Creates a new conversation between to external phone numbers
 * @param {TwilioClient} client
 * @param {string} name
 * @return {Promise<ConversationInstance>}
 */
async function createConversation(client, name) {
  const conversation = await client.conversations.v1.conversations.create({
    friendlyName: name,
  });

  return conversation;
}

/**
 * Get a conversation by SID
 * @param {TwilioClient} client
 * @param {string} conversationSid
 * @return {Promise<null|ConversationInstance>}
 */
async function getConversation(client, conversationSid) {
  try {
    return await client.conversations.v1.conversations(conversationSid).fetch();
  } catch (e) {
    if (e.status === 404) {
      return null;
    }
    throw e;
  }
}

/**
 * @param {ConversationInstance} conversation
 * @param {string} baseUrl
 * @return {Promise<void>}
 */
async function updateConversationWebhook(conversation, baseUrl) {
  const webhooks = await conversation.webhooks().list();
  if (webhooks.length > 0) {
    await webhooks[0].update({
      target: 'webhook',
      configuration: {
        url: `${baseUrl}/conversation/`,
        method: 'POST',
        filters: ['onMessageAdded'],
      },
    });
  } else {
    await conversation.webhooks().create({
      target: 'webhook',
      configuration: {
        url: `${baseUrl}/conversation/`,
        method: 'POST',
        filters: ['onMessageAdded'],
      },
    });
  }
}

/**
 * Remove a conversation
 * @param {TwilioClient} client
 * @param {string} conversationSid
 * @return {Promise<boolean>}
 */
async function removeConversation(client, conversationSid) {
  return await client.conversations.v1.conversations(conversationSid).remove();
}

/**
 * Add a SMS participant to a conversation
 * @param {TwilioClient} client
 * @param {string} conversationSid
 * @param {string} number
 * @return {Promise<ParticipantInstance>}
 */
async function addParticipant(client, conversationSid, number) {
  return await client.conversations.v1
    .conversations(conversationSid)
    .participants.create({
      messagingBinding: {
        address: number,
        proxyAddress: cfg.twilioPhoneNumber,
      },
    });
}

/**
 * Remove a participant from a conversation
 * @param {TwilioClient} client
 * @param {string} conversationSid
 * @param {string} participantSid
 * @return {Promise<boolean>}
 */
async function removeParticipant(client, conversationSid, participantSid) {
  return await client.conversations.v1
    .conversations(conversationSid)
    .participants(participantSid)
    .remove();
}

module.exports = {
  createConversation,
  getConversation,
  updateConversationWebhook,
  removeConversation,
  addParticipant,
  removeParticipant,
};
