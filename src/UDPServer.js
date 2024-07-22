const dgram = require('dgram');
const crypto = require('crypto');
const EventEmitter = require('events');
const log = require('./log');

const LEN_SIZE = 2;
const HASH_SIZE = 6;
const SERIAL_NUMBER_SIZE = 4;
const LEN_HASH_SIZE = (LEN_SIZE + HASH_SIZE);
const HEADER_SIZE = (LEN_HASH_SIZE + SERIAL_NUMBER_SIZE);

class UDPServer extends EventEmitter {
  constructor() {
    super();
    this.port = null;
    this.isListening = false;
    this.server = dgram.createSocket({ type: 'udp4' });

    this.server.on('error', (err) => {
      log.error('UDP Server error: %s', err.stack);
      this.server.close();
    });

    this.server.on('close', () => {
      log.error('UDP Server close');
      this.isListening = false;
      this.emit('close');
    });

    this.server.on('listening', () => {
      const address = this.server.address();
      log.info('UDP Server listening %s:%s', address.address, address.port);
      this.isListening = true;
      this.emit('listening', address);
    });

    this.server.on('message', (msg, rinfo) => {
      log.info(`Received from: ${rinfo.address}:${rinfo.port} l: ${msg.length} data: ${msg.toString('hex')}`);

      try {
        if (msg.readUInt16LE(0) !== msg.length) {
          throw new Error('Length field does not match');
        }

        const hash = msg.slice(LEN_SIZE, LEN_HASH_SIZE);

        const sha256 = crypto.createHash('sha256');
        sha256.update(msg.slice(LEN_HASH_SIZE));
        const hashCalc = sha256.digest().slice(0, HASH_SIZE);

        if (Buffer.compare(hash, hashCalc) !== 0) {
          throw new Error('Hash does not match');
        }

        const serialNumber = msg.readUInt32LE(LEN_HASH_SIZE);
        const raw = msg.slice(HEADER_SIZE);

        this.emit('message', {
          time: Math.floor((new Date().getTime()) / 1000),
          port: this.port,
          serial_number: serialNumber,
          raw,
        });

      } catch (error) {
        log.warn('UDP Server parse error: %s', error);
        this.emit('error', error);
      }
    });
  }

  address() {
    return this.server.address();
  }

  listen(port, address = null) {
    this.port = port;
    this.server.bind(port, address);
  }

  ready(timeout = 5000) {
    const timeoutEnd = new Date().getTime() + timeout;
    const self = this;
    return new Promise((resolve, reject) => {
      function check() {
        if (self.isListening) {
          resolve();
        } else if (timeoutEnd < (new Date().getTime())) {
          reject(new Error('Timeout'));
        } else {
          setTimeout(check, 50);
        }
      }
      check();
    });
  }
}

module.exports = UDPServer;
