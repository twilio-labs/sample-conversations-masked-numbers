'use strict';

const express = require('express');
const PhoneNumber = require('../src/db').PhoneNumber;

/* eslint-disable new-cap */
const router = express.Router();

// POST: /conversation
router.post('/conversation', function(req, res, next) {
  PhoneNumber.getByNumber(req.body.Author).then(phoneNumber => {
    phoneNumber.latestActivity = new Date();
    phoneNumber.save();
  });
  res.send('');
});

module.exports = router;
