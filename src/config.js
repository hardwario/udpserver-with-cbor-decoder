/* eslint-disable no-param-reassign */
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const log = require('./log');
const { newDecoderFromFile } = require('./decoder');

const DEFAUL_TOPIC = 'chester/{device}';

class Config {
  constructor(text, dir = null) {
    if (dir === null) {
      dir = process.cwd();
    }
    const cfg = yaml.parse(text);
    if (cfg.decoders === undefined) {
      throw new Error('config: no decoders found in config');
    }

    this.decoders = [];
    this.devices = {};
    this.default = null;

    for (let i = 0; i < cfg.decoders.length; i += 1) {
      const cfgDecoder = cfg.decoders[i];
      if (cfgDecoder.name === undefined) {
        throw new Error('config: decoder: name is required');
      }
      if (cfgDecoder.devices === undefined && !cfgDecoder.default) {
        throw new Error('config: decoder: devices or default is required');
      }
      if (cfgDecoder.decoder === undefined) {
        throw new Error('config: decoder: decoder is required');
      }

      const decoder = {
        name: cfgDecoder.name,
        topic: cfgDecoder.topic || DEFAUL_TOPIC,
        decoder: newDecoderFromFile(path.resolve(dir, cfgDecoder.decoder)),
      };

      this.decoders.push(decoder);

      if (cfgDecoder.default) {
        this.default = decoder;
      }

      for (let j = 0; cfgDecoder.devices && j < cfgDecoder.devices.length; j += 1) {
        const device = cfgDecoder.devices[j];
        if (device === undefined) {
          throw new Error('config: decoder: device is required');
        }
        this.devices[device] = decoder;
      }
    }

    if (this.default === null) {
      log.console.warn('config: no default decoder found, set default: true on one of the decoders');
    }

    this.mqtt = cfg.mqtt || { enable: false };

    if (this.mqtt.url === undefined) {
      this.mqtt.url = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    }
    if (this.mqtt.options === undefined) {
      this.mqtt.options = {};
    }

    if (process.env.MQTT_ENABLE) {
      this.mqtt.enable = process.env.MQTT_ENABLE !== 'false';
    }

    if (this.mqtt.options.username === undefined) {
      this.mqtt.options.username = process.env.MQTT_USERNAME || '';
    }

    if (this.mqtt.options.password === undefined) {
      this.mqtt.options.password = process.env.MQTT_PASSWORD || '';
    }

    if (this.mqtt.options.clientId === undefined) {
      this.mqtt.options.clientId = process.env.MQTT_CLIENT_ID || '';
    }

    if (this.mqtt.options.ca === undefined && process.env.MQTT_CA) {
      this.mqtt.options.ca = fs.readFileSync(process.env.MQTT_CA);
    }

    if (this.mqtt.options.cert === undefined && process.env.MQTT_CERT) {
      this.mqtt.options.cert = fs.readFileSync(process.env.MQTT_CERT);
    }

    if (this.mqtt.options.key === undefined && process.env.MQTT_KEY) {
      this.mqtt.options.key = fs.readFileSync(process.env.MQTT_KEY);
    }
  }

  isMqttEnabled() {
    return !!this.mqtt.enable;
  }

  getMqttUrl() {
    return this.mqtt.url;
  }

  getMqttOptions() {
    return this.mqtt.options;
  }

  getDecoder(device) {
    return this.devices[device] || this.default;
  }
}

function newDecoder(text, dir = null) {
  return new Config(text, dir);
}

function getConfigFromFile(filename) {
  const text = fs.readFileSync(filename).toString('utf8');
  const dir = path.dirname(path.resolve(filename));
  return newDecoder(text, dir);
}

module.exports = { getConfigFromFile, newDecoder };
