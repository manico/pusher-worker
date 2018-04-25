import axios from 'axios';
import cryptoJS from 'crypto-js';
import { assign, defaults, template } from 'lodash';

/*!
* Pusher Web Worker
* @license  MIT
*/

const apiEndpoint = 'http://api-${cluster}.pusher.com';

const defaultOptions = {
  cluster: 'eu',
  version: '1.0',
};

const getAuthTimestamp = () => {
  const currentDate = new Date();
  return Math.round(currentDate.getTime() / 1000);
};

const getAuthSignature = (method, params, options) => {
  const authSignatureRaw = `${method}\n
    /apps/${options.appId}/events\n
    auth_key=${params.auth_key}
    &auth_timestamp=${params.auth_timestamp}
    &auth_version=${params.auth_version}
    &body_md5=${params.body_md5}`;

  return cryptoJS.HmacSHA256(authSignatureRaw, options.secret).toString(cryptoJS.enc.Hex);
};

const getBodyMD5 = (payload) => {
  const encryptedPayload = cryptoJS.MD5(payload);
  return encryptedPayload.toString();
};

const sendEvent = (payload, options) => {
  defaults(options, defaultOptions);

  const endpoint = template(apiEndpoint)({
    cluster: options.cluster,
  });

  const authTimestamp = getAuthTimestamp();

  const params = {
    auth_timestamp: authTimestamp,
    auth_version: options.version,
    body_md5: getBodyMD5(payload),
    auth_key: options.key,
  };

  const payloadData = payload.data || null;
  assign(payload, {
    data: JSON.stringify(payloadData),
  });

  params.auth_signature = getAuthSignature('POST', params, options);

  axios.post(`${endpoint}/apps/${options.appId}/events`, payload, {
    params,
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((error) => {
    const errorMessage = error.response ? error.response.data : error;
    /* eslint no-console: "off" */
    console.warn('Pusher worker sendEvent error', errorMessage);
  });
};

const logEvent = (message) => {
  /* eslint no-console: "off" */
  console.warn('Pusher worker unknown action', message.action);
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

self.onerror = (event) => {
  /* eslint no-console: "off" */
  console.warn('Pusher worker error', event);
};
