const low = require('lowdb');
const path = require('path');
const moment = require('moment');
const FileAsync = require('lowdb/adapters/FileAsync');
const Memory = require('lowdb/adapters/Memory');

const adapter =
  process.env.NODE_ENV === 'test'
    ? new Memory()
    : new FileAsync(path.join(__dirname, '../_data/db.json'));

let db;

/**
 * Returns a cached database instance of lowdb
 * @return {Promise<*>} database instance
 */
async function getDb() {
  if (db) {
    return db;
  }
  db = await low(adapter);
  db.defaults({ conversation: null, phone_number: [] }).write();
  return db;
}

/**
 * Class representing the Conversation entity. It's responsible to interact
 * with the database
 */
class Conversation {
  /**
   * Creates an instance of the setup
   * @param {object} data
   */
  constructor(data) {
    this.sid = data.sid;
  }

  /**
   * Turns the properties of this class instance into a plain JSON
   * @return {object} JSON object with all conversation properties
   */
  toJson() {
    return {
      sid: this.sid,
    };
  }

  /**
   * Saves an entry to the database or updates it if necessary
   *
   * @return {Promise<Conversation>} the current instance of this class
   */
  async save() {
    const db = await getDb();
    await db.set(Conversation.dbKey, this.toJson()).write();
    return this;
  }

  /**
   * Lookup for the setup in the database and returns an instance of this class
   *
   * @static
   * @return {Promise<Conversation>} the instance of first match
   */
  static async get() {
    const db = await getDb();
    const entity = db.get(Conversation.dbKey).value();
    if (!entity) {
      return null;
    }
    return new Conversation(entity);
  }
}

Conversation.dbKey = 'conversation';

/**
 * Class representing a phone number withing a conversation. It's responsible
 * of the DB interaction
 */
class PhoneNumber {
  /**
   * Creates an instance of a PhoneNumber object
   * @param {object} data
   */
  constructor(data) {
    this.sid = data.sid;
    this.conversation = data.conversation;
    this.number = data.number;
    this.expirationTime = data.expirationTime;
    this.latestActivity =
      typeof data.latestActivity === 'string'
        ? new Date(data.latestActivity)
        : data.latestActivity;
  }

  /**
   * Turns the properties of this class instance into a plain JSON
   * @return {object}
   */
  toJson() {
    return {
      sid: this.sid,
      conversation: this.conversation,
      number: this.number,
      latestActivity: this.latestActivity,
      expirationTime: this.expirationTime,
    };
  }

  /**
   * Saves an entry to the database or updates it if necessary
   *
   * @return {Promise<PhoneNumber>} the current instance of this class
   */
  async save() {
    const db = await getDb();
    const entry = db.get(PhoneNumber.dbKey).find({ sid: this.sid });
    if (!entry.value()) {
      await db
        .get(PhoneNumber.dbKey)
        .push(this.toJson())
        .write();
    } else {
      await entry.assign(this.toJson()).write();
    }
    return this;
  }

  /**
   * Validates phone number active state
   * @return {boolean} true if the phone number inactivity if greater than its expiration time
   */
  isInactive() {
    const timeInactive = moment().diff(moment(this.latestActivity), 'seconds');
    return timeInactive > this.expirationTime * 60;
  }

  /**
   *
   * @return {Promise<*|void|this|this|boolean|IDBRequest<undefined>>}
   */
  async delete() {
    const db = await getDb();
    return db
      .get(PhoneNumber.dbKey)
      .remove({ sid: this.sid })
      .write();
  }

  /**
   * Get a PhoneNumber instance from DB by sid if exists
   * @param {string} sid
   * @return {Promise<null|PhoneNumber>}
   */
  static async get(sid) {
    const db = await getDb();
    const entry = db.get(PhoneNumber.dbKey).find({ sid: sid });
    if (entry.value()) {
      return new PhoneNumber(entry.value());
    }
    return null;
  }

  /**
   * Get a PhoneNumber instance from DB by sid if exists
   * @param {string} number
   * @return {Promise<PhoneNumber|null>}
   */
  static async getByNumber(number) {
    const db = await getDb();
    const entry = db.get(PhoneNumber.dbKey).find({ number: number });
    if (entry.value()) {
      return new PhoneNumber(entry.value());
    }
    return null;
  }

  /**
   * Return a list with all phone numbers in the DB
   * @return {Promise<PhoneNumber[]>}
   */
  static async all() {
    const db = await getDb();
    return db
      .get(PhoneNumber.dbKey)
      .value()
      .map(value => new PhoneNumber(value));
  }
}

PhoneNumber.dbKey = 'phone_number';

module.exports = { Conversation, PhoneNumber };
