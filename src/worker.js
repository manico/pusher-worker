import axios from 'axios';
import { defaults, template } from 'lodash';

/*!
* Pusher Web Worker
* @license  MIT
*/

const apiEndpoint = 'http://api-${cluster}.pusher.com';
const apiAuthVersion = '1.0';

const defaultOptions = {
  cluster: 'eu',
};

const sendEvent = (payload, options) => {
  defaults(options, defaultOptions);

  const endpoint = template(apiEndpoint)({
    cluster: options.cluster,
  });

  axios.post(`${endpoint}/apps/${options.appId}/events`, payload, {
    params: {
      auth_timestamp: null,
      auth_version: apiAuthVersion,
      body_md5: null,
      auth_key: options.authKey,
      auth_signature: null,
    },
  });
};

const logEvent = (message) => {
  /* eslint no-console: "off" */
  console.warn('Unknown action', message.action);
};

self.onmessage = (event) => {
  const message = event.data;
  if (message.action) {
    switch (message.action) {
      case 'sendEvent':
        sendEvent(message.payload, message.options);
        break;
      default:
        logEvent(message);
    }
  }
};
