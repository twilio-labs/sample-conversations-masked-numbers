const describe = require('mocha').describe;
const expect = require('chai').expect;
const path = require('path');
const client = require('twilio')('ACxxx', 'fake_token');
const conversations = require('../src/conversations/conversations');

ApiMocker = require('./api_mocker').ApiMocker;

const mocker = new ApiMocker(path.join(__dirname, 'fixtures'));

describe('conversations', function() {
  describe('on create', function() {
    it('makes a request and returns a ConversationInstance', async function() {
      client.httpClient.request = mocker.mock([{ resource: 'Conversations' }]);

      const conversation = await conversations.createConversation(
        client,
        'name',
        'http://fake-url'
      );

      expect(conversation).to.be.an('object');
      expect(conversation.sid).to.eql('CHXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      expect(mocker.callsCounter).to.eql(1);
    });
  });

  describe('on remove', function() {
    it('makes one request and returns true', async function() {
      client.httpClient.request = mocker.mock([{ resource: 'Conversations' }]);

      const response = await conversations.removeConversation(
        client,
        'CHxxxxxx'
      );

      expect(response).to.eql(true);
      expect(mocker.callsCounter).to.eql(1);
    });
  });

  describe('on fetch existing', function() {
    it('makes one request and returns a ConversationInstance', async function() {
      client.httpClient.request = mocker.mock([{ resource: 'Conversations' }]);

      const conversation = await conversations.getConversation(
        client,
        'CHxxxxxx'
      );

      expect(conversation).to.be.an('object');
      expect(conversation.sid).to.eql('CHXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      expect(mocker.callsCounter).to.eql(1);
    });
  });

  describe('on fetch non-existing', function() {
    it('makes one request and returns null', async function() {
      client.httpClient.request = mocker.mock([
        { resource: 'Conversations', options: { instance: 'invalid' } },
      ]);

      const conversation = await conversations.getConversation(
        client,
        'CHxxxxxx'
      );

      expect(conversation).to.eql(null);
      expect(mocker.callsCounter).to.eql(1);
    });
  });

  describe('on update webhooks', function() {
    it('makes two requests and returns void', async function() {
      client.httpClient.request = mocker.mock([{ resource: 'Conversations' }]);
      const conversation = await conversations.getConversation(
        client,
        'CHxxxxxx'
      );
      client.httpClient.request = mocker.mock([
        { resource: 'Webhooks', options: { list: 'empty' } },
      ]);

      const response = await conversations.updateConversationWebhook(
        conversation,
        'http://example.com'
      );

      expect(response).to.eql(undefined);
      expect(mocker.callsCounter).to.eql(2);
    });
  });
});

describe('participants', function() {
  describe('on add', function() {
    it('makes a request and returns a ParticipanInstance', async function() {
      client.httpClient.request = mocker.mock([{ resource: 'Participants' }]);

      const participant = await conversations.addParticipant(
        client,
        'CHxxxxxx',
        '+1234567890'
      );

      expect(participant).to.be.an('object');
      expect(participant.sid).to.eql('MBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      expect(mocker.callsCounter).to.eql(1);
    });
  });

  describe('on remove', function() {
    it('makes a request and returns true', async function() {
      client.httpClient.request = mocker.mock([{ resource: 'Participants' }]);

      const response = await conversations.removeParticipant(
        client,
        'CHxxxxxx',
        '+1234567890'
      );

      expect(response).to.eql(true);
      expect(mocker.callsCounter).to.eql(1);
    });
  });
});
