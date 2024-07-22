/* eslint-disable no-param-reassign */
const fs = require('fs');
const axios = require('axios');
const log = require('./log');
const UDPServer = require('./UDPServer');
const MQTTClient = require('./MQTTClient');
const { getConfigFromFile } = require('./config');

const decoderYaml = process.env.DECODER_YAML || './config/config.yaml';

const config = getConfigFromFile(decoderYaml);
let mqttclient = null;
if (config.isMqttEnabled()) {
  log.info('Connecting to MQTT broker: %s', config.getMqttUrl());
  mqttclient = new MQTTClient(config.getMqttUrl(), config.getMqttOptions());
} else {
  log.info('MQTT is disabled');
}

const httpUrl = process.env.HTTP_URL || null;

async function publish(msg) {

  const device = msg.serial_number;
  const decoder = config.getDecoder(device);
  msg.data = decoder.decoder.decode(msg.raw);
  msg.raw = msg.raw.toString('hex');

  if (mqttclient) {
    if (decoder === null) {
      log.error(`No decoder found for device: ${device}`);
    } else {
      const topic = decoder.topic.replace('{device}', device);
      const payload = JSON.stringify(msg, (key, value) => (typeof value === 'bigint'
        ? value.toString()
        : value));
      mqttclient.publish(topic, payload);
    }
  }

  if (httpUrl) {
    axios.post(process.env.HTTP_URL, msg, {
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((err) => {
      log.error(err);
    });
  }
}

const udpserver = new UDPServer();

udpserver.on('message', (msg) => {
  publish(msg);
});

udpserver.listen(process.env.PORT || 5000);

module.exports = { udpserver, mqttclient };
