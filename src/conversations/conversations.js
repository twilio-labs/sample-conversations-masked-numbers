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
 * @param {TwilioClient} client
 * @param {string} conversationSid
 * @param {string} baseUrl
 * @return {Promise<WebhookInstance[]>}
 */
async function getConversationWebhooks(client, conversationSid) {
  return await client.conversations.v1
    .conversations(conversationSid)
    .webhooks.list();
}

/**
 * @param {TwilioClient} client
 * @param {string} conversationSid
 * @param {WebhookInstance[]} webhooks
 * @param {string} baseUrl
 * @return {Promise<void>}
 */
async function updateConversationWebhooks(
  client,
  conversationSid,
  webhooks,
  baseUrl
) {
  if (webhooks.length > 0) {
    await client.conversations.v1
      .conversations(conversationSid)
      .webhooks(webhooks[0].sid)
      .update({
        target: 'webhook',
        configuration: {
          url: `${baseUrl}/conversation/`,
          method: 'POST',
          filters: ['onMessageAdded'],
        },
      });
  } else {
    await client.conversations.v1.conversations.create({
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
  getConversationWebhooks,
  updateConversationWebhooks,
  removeConversation,
  addParticipant,
  removeParticipant,
};
