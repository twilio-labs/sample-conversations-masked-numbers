const fs = require('fs');
const path = require('path');

/**
 * Class to create a fake helper library http client request method
 * @param {object[]} options
 * @return {function}
 */
class ApiMocker {
  /**
   * Create an instance of the mocker
   * @param {string} fixturesPath
   */
  constructor(fixturesPath) {
    this.path = fixturesPath;
    this.callsCounter = 0;
  }

  /**
   * Returns a fake request method that will look for responses in the fixtures path
   * @param {object} options
   * @return {function(...[*]=)}
   */
  mock(options) {
    const mocker = this;
    mocker.callsCounter = 0;
    return function(requestOptions) {
      mocker.callsCounter += 1;
      for (const option of options) {
        if (requestOptions.uri.includes(option.resource)) {
          const value = mocker.getResponse(
            option.resource,
            option.options,
            requestOptions.uri,
            requestOptions.method
          );
          return new Promise(function(resolve, reject) {
            resolve(value);
          });
        }
      }
    };
  }

  /**
   * Build the API response base on the request URL and METHOD
   * @param {string} resource
   * @param {object} options
   * @param {string} uri
   * @param {string} method
   * @return {object}
   */
  getResponse(resource, options, uri, method) {
    const parts = [resource];
    // Check for list url
    if (new RegExp(`${resource}(\.json)?$`).test(uri)) {
      if (method === 'POST') {
        parts.push('instance');
      } else {
        parts.push('list');
      }
    } else {
      if (method === 'DELETE') {
        return { statusCode: 204, body: '' };
      } else {
        parts.push('instance');
      }
    }
    // Add extra option for the filename if provided
    if (options && options.hasOwnProperty(parts[parts.length - 1])) {
      parts.push(options[parts[parts.length - 1]]);
    }
    const filename = parts.join('.');
    const status = method === 'POST' ? 201 : 200;
    return this.getResponseValue(filename, status);
  }

  /**
   * Create a response value from file content if available
   * @param {string} filename
   * @param {number} status
   * @return {{body: string, statusCode: number}|{body: Buffer, statusCode: number}}
   */
  getResponseValue(filename, status) {
    try {
      return {
        statusCode: status,
        body: fs.readFileSync(path.join(this.path, `${filename}.json`)),
      };
    } catch (e) {
      return {
        statusCode: 404,
        body: '{}',
      };
    }
  }
}

module.exports = { ApiMocker };
