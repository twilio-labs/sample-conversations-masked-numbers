'use strict';

const express = require('express');
const conversations = require('../src/conversations');
const PhoneNumber = require('../src/db').PhoneNumber;

/* eslint-disable new-cap */
const router = express.Router();

// GET: /
router.get('/', async function(req, res, next) {
  res.render('index', {
    phoneNumbers: await PhoneNumber.all(),
    local: req.hostname.includes('local'),
  });
});

// GET: /add-phone
router.get('/add-phone', function(req, res, next) {
  res.render('phone_form');
});

// POST: /add-phone
router.post('/add-phone', async function(req, res, next) {
  const baseUrl = `${req.protocol}://${req.hostname}/webhooks`;
  const number = req.body.phoneNumber;
  const expirationTime = req.body.expirationTime;

  try {
    const conversation = await conversations.getConversation(baseUrl);
    const phoneNumber = await conversations.addPhoneNumber(
      conversation,
      number,
      expirationTime
    );
    if (phoneNumber) {
      await conversations.sendMessage(
        phoneNumber,
        'Conversation session began. Write some message.'
      );
    } else {
      console.log('Nothing added: probably it already exists');
    }
  } catch (e) {
    console.log(e);
  }

  res.redirect('/');
});

module.exports = router;
