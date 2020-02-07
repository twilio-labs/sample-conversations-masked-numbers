const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const client = require('twilio')('ACxxx', 'fake_token');
const conversations = require('../src/conversations/conversations');

chai.use(sinonChai);

describe('conversations', function() {
  afterEach(() => {
    sinon.restore();
  });

  describe('on create', function() {
    it('makes a request and returns a ConversationInstance', async function() {
      const conversationInstance = require('./fixtures/conversations.instance');

      sinon.stub(client.httpClient, 'request').resolves({
        statusCode: 201,
        body: JSON.stringify(conversationInstance),
      });

      const conversation = await conversations.createConversation(
        client,
        'name'
      );

      expect(conversation).to.be.an('object');
      expect(conversation.sid).to.eql('CHXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      expect(client.httpClient.request).to.have.been.calledOnce;
    });
  });

  describe('on remove', function() {
    it('makes one request and returns true', async function() {
      sinon.stub(client.httpClient, 'request').resolves({
        statusCode: 204,
        body: '',
      });

      const response = await conversations.removeConversation(
        client,
        'CHxxxxxx'
      );

      expect(response).to.be.true;
      expect(client.httpClient.request).to.have.been.calledOnce;
    });
  });

  describe('on fetch', function() {
    context('when conversation exists', function() {
      it('makes one request and returns a ConversationInstance', async function() {
        const conversationInstance = require('./fixtures/conversations.instance');

        sinon.stub(client.httpClient, 'request').resolves({
          statusCode: 201,
          body: JSON.stringify(conversationInstance),
        });

        const conversation = await conversations.getConversation(
          client,
          'CHxxxxxx'
        );

        expect(conversation).to.be.an('object');
        expect(conversation.sid).to.eql('CHXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
        expect(client.httpClient.request).to.have.been.calledOnce;
      });
    });

    context('conversation does not exist', () => {
      it('makes one request and returns null', async () => {
        sinon.stub(client.httpClient, 'request').resolves({
          statusCode: 404,
          body: '{}',
        });

        const conversation = await conversations.getConversation(
          client,
          'CHxxxxxx'
        );

        expect(conversation).to.be.null;
        expect(client.httpClient.request).to.have.been.calledOnce;
      });
    });
  });

  describe('on get webhooks', function() {
    it('makes a requests and returns an array', async function() {
      const webhookList = require('./fixtures/webhooks.list');

      sinon.stub(client.httpClient, 'request').resolves({
        statusCode: 200,
        body: JSON.stringify(webhookList),
      });

      const webhooks = await conversations.getConversationWebhooks(
        client,
        'CHxxx'
      );

      expect(webhooks).to.be.an('array');
      expect(client.httpClient.request).to.have.been.calledOnce;
    });
  });

  describe('on update webhooks', function() {
    context('when webhooks is empty', () => {
      it('makes two requests and returns void', async () => {
        const webhookList = require('./fixtures/webhooks.list');
        const request = sinon.stub(client.httpClient, 'request');
        request.resolves({
          statusCode: 200,
          body: JSON.stringify(webhookList),
        });

        await conversations.updateConversationWebhooks(
          client,
          'CHxxx',
          [],
          'http://example.com'
        );

        expect(client.httpClient.request).to.have.been.calledOnce;
      });
    });

    context('when has one webhook', () => {
      it('makes one requests and returns void', async () => {
        const webhookList = require('./fixtures/webhooks.list');
        const request = sinon.stub(client.httpClient, 'request');
        request.resolves({
          statusCode: 200,
          body: JSON.stringify(webhookList),
        });

        await conversations.updateConversationWebhooks(
          client,
          'CHxxx',
          [{ sid: 'WHxxx' }],
          'http://example.com'
        );

        expect(client.httpClient.request).to.have.been.calledOnce;
      });
    });
  });
});

describe('participants', function() {
  afterEach(() => {
    sinon.restore();
  });

  describe('on add', function() {
    it('makes a request and returns a ParticipanInstance', async function() {
      const participantInstance = require('./fixtures/participants.instance');

      sinon.stub(client.httpClient, 'request').resolves({
        statusCode: 201,
        body: JSON.stringify(participantInstance),
      });

      const participant = await conversations.addParticipant(
        client,
        'CHxxxxxx',
        '+1234567890'
      );

      expect(participant).to.be.an('object');
      expect(participant.sid).to.eql('MBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      expect(client.httpClient.request).to.have.been.calledOnce;
    });
  });

  describe('on remove', function() {
    it('makes a request and returns true', async function() {
      sinon.stub(client.httpClient, 'request').resolves({
        statusCode: 204,
        body: '',
      });

      const response = await conversations.removeParticipant(
        client,
        'CHxxxxxx',
        '+1234567890'
      );

      expect(response).to.be.true;
      expect(client.httpClient.request).to.have.been.calledOnce;
    });
  });
});
