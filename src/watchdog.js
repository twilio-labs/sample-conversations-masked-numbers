'use strict';

const PhoneNumbers = require('./db').PhoneNumber;
const conversations = require('./conversations');

/**
 * Get a list of inactive phone numbers
 * @return {Promise<PhoneNumber[]>}
 */
async function getInactivePhoneNumbers() {
  return (await PhoneNumbers.all()).filter(phoneNumber =>
    phoneNumber.isInactive()
  );
}

/**
 * Starts an async task that watches for inactive phone numbers
 */
async function phoneNumbersWatchdog() {
  const phoneNumbers = await getInactivePhoneNumbers();
  for (const phoneNumber of phoneNumbers) {
    try {
      await conversations.sendMessage(phoneNumber, 'This session expired!');
      await conversations.removePhoneNumber(phoneNumber);
      await phoneNumber.delete();
    } catch (e) {
      console.log(e.message);
    }
  }

  // Re-run after 10 seconds
  setTimeout(() => {
    phoneNumbersWatchdog();
  }, 10000);
}

module.exports = { phoneNumbersWatchdog };
