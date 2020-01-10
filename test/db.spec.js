const describe = require('mocha').describe;
const expect = require('chai').expect;
const moment = require('moment');

const { Conversation, PhoneNumber } = require('../src/db');

describe('Conversation', function() {
  describe('on get non-existing conversation', function() {
    it('returns null', async function() {
      const conversation = await Conversation.get();

      expect(conversation).to.eql(null);
    });
  });
  describe('on create', function() {
    it('returns an object with provided attributes', async function() {
      const conversation = await new Conversation({ sid: 'CHxxx' }).save();

      expect(conversation).to.be.an('object');
      expect(conversation.sid).to.eql('CHxxx');
    });
  });
  describe('on get existing conversation', function() {
    it('returns an object', async function() {
      await new Conversation({ sid: 'CHxxx' }).save();

      const conversation = await Conversation.get();

      expect(conversation).to.be.an('object');
      expect(conversation.sid).to.eql('CHxxx');
    });
  });
});

describe('PhoneNumber', function() {
  describe('on create', function() {
    it('return an object with provided attributes', async function() {
      const phoneNumber = await new PhoneNumber({
        sid: 'PNxxx',
        conversation: 'CHxxx',
        number: '+1234567890',
        latestActivity: '2020-01-09T22:09:32.579Z',
        expirationTime: 10,
      }).save();

      expect(phoneNumber).to.be.an('object');
      expect(phoneNumber.sid).to.eql('PNxxx');
      expect(phoneNumber.conversation).to.eql('CHxxx');
      expect(phoneNumber.number).to.eql('+1234567890');
      expect(phoneNumber.latestActivity).to.eql(
        new Date('2020-01-09T22:09:32.579Z')
      );
      expect(phoneNumber.expirationTime).to.eql(10);

      await phoneNumber.delete();
    });
  });

  describe('on get by sid non-existing number', function() {
    it('returns null', async function() {
      const phoneNumber = await PhoneNumber.get('PNxxx');

      expect(phoneNumber).to.eql(null);
    });
  });

  describe('on get by sid existing number', function() {
    it('returns a ', async function() {
      await new PhoneNumber({
        sid: 'PNxxx',
        conversation: 'CHxxx',
        number: '+12345',
        latestActivity: '2020-01-09T22:09:32.579Z',
        expirationTime: 1,
      }).save();

      const phoneNumber = await PhoneNumber.get('PNxxx');

      expect(phoneNumber).to.be.an('object');
      expect(phoneNumber.sid).to.eql('PNxxx');
      expect(phoneNumber.conversation).to.eql('CHxxx');

      await phoneNumber.delete();
    });
  });

  describe('all', function() {
    it('returns list of objects', async function() {
      await new PhoneNumber({
        sid: 'PNxxx',
        conversation: 'CHxxx',
        number: '+12345',
        latestActivity: '2020-01-09T22:09:32.579Z',
        expirationTime: 1,
      }).save();

      const numbers = await PhoneNumber.all();

      expect(numbers).to.be.an('array');
      expect(numbers.length).to.eql(1);
      expect(numbers[0]).to.be.an('object');
    });
  });

  describe('inactivity', function() {
    it('isInactive returns true when inactivity > expiration time', function() {
      const phoneNumber = new PhoneNumber({
        latestActivity: moment()
          .subtract(7, 'minutes')
          .toDate(),
        expirationTime: 5,
      });

      expect(phoneNumber.isInactive()).to.eql(true);
    });

    it('isInactive returns false when inactivity < expiration time', function() {
      const phoneNumber = new PhoneNumber({
        latestActivity: moment()
          .subtract(4, 'minutes')
          .toDate(),
        expirationTime: 5,
      });

      expect(phoneNumber.isInactive()).to.eql(false);
    });
  });
});
