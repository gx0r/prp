#!/usr/bin/env node
'use strict';
const util = require('util');
const readFile = util.promisify(require('fs').readFile);
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();
const https = require('https');
const fs = require('fs');
const net = require('net');
const createCertificate = util.promisify(require('pem').createCertificate);

async function createProxy(config) {
  const socket = new net.Server();
  socket.listen(config.port);

  try {
    process.setuid('nobody');
    process.seteuid('nobody');
    process.setgid('nobody');
    process.setegid('nobody');
  } catch (e) {
    console.warn(e);
  }

  return await (async () => {
    const { username, password, target, port } = config;
    const auth = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

    // generate a cert/keypair on the fly
    const keys = await createCertificate({
      days: 1,
      selfSigned: true
    });

    https.createServer({
      key: keys.serviceKey,
      cert: keys.certificate
    }, (req, res) => {
      if (req.headers.authorization !== auth) {
        res.writeHead(401, {
          'WWW-Authenticate': 'Basic realm="users"'
        });
        res.end();
      } else {
        proxy.web(req, res, { target });
        proxy.on('error', err => {
          console.error(err);
          res.end();
        })
      }
    }).listen(socket);

    console.log(`prp listening on https://localhost:${port}`);
  })();
}

(async function () {
  const config = JSON.parse(await readFile('./prp.config.json'));
  createProxy(config);
})();
