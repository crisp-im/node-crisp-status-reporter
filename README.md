# node-crisp-status-reporter

[![Build Status](https://img.shields.io/travis/crisp-im/node-crisp-status-reporter/master.svg)](https://travis-ci.org/crisp-im/node-crisp-status-reporter) [![Test Coverage](https://img.shields.io/coveralls/crisp-im/node-crisp-status-reporter/master.svg)](https://coveralls.io/github/crisp-im/node-crisp-status-reporter?branch=master) [![NPM](https://img.shields.io/npm/v/crisp-status-reporter.svg)](https://www.npmjs.com/package/crisp-status-reporter) [![Downloads](https://img.shields.io/npm/dt/crisp-status-reporter.svg)](https://www.npmjs.com/package/crisp-status-reporter)

**Crisp Status Reporter for Node.**

Crisp Status Reporter is used to actively submit health information to Crisp Status from your apps. Apps are best monitored via application probes, which are able to report detailed system information such as CPU and RAM load. This lets Crisp Status show if an application host system is under high load.

## How to install?

Include `crisp-status-reporter` in your `package.json` dependencies.

Alternatively, you can run `npm install crisp-status-reporter --save`.

## How to use?

### 1. Create reporter

`crisp-status-reporter` can be instantiated as such:

```javascript
var CrispStatusReporter = require("crisp-status-reporter").CrispStatusReporter;

var crispStatusReporter = new CrispStatusReporter({
  token      : "YOUR_TOKEN_SECRET",  // Your reporter token (given by Crisp)
  service_id : "YOUR_SERVICE_ID",    // Service ID containing the parent Node for Replica (given by Crisp)
  node_id    : "YOUR_NODE_ID",       // Node ID containing Replica (given by Crisp)
  replica_id : "192.168.1.10",       // Unique Replica ID for instance (ie. your IP on the LAN)
  interval   : 30,                   // Reporting interval (in seconds; defaults to 30 seconds if not set)
  console    : require("console")    // Console instance if you need to debug issues
});
```

### 2. Teardown reporter

If you need to teardown an active reporter, you can use the `end()` method to unbind it.

```javascript
crispStatusReporter.end();
```

## Where can I find my token?

Your private token can be found on your [Crisp dashboard](https://app.crisp.chat/). Go to Settings, then Status Page, and then scroll down to "Configure your Status Reporter". Copy the secret token shown there, and use it while configuring this library in your application.

## How to add monitored node?

You can easily add a push node for the application running this library on your Crisp dashboard. Add the node, and retrieve its `service_id` and `node_id` as follows:

<p align="center">
  <img height="300" src="https://crisp-im.github.io/node-crisp-status-reporter/images/setup.gif" alt="How to add monitored node">
</p>

## Get more help

You can find more help on our helpdesk article: [How to setup the Crisp Status Reporter library?](https://help.crisp.chat/en/article/how-to-setup-the-crisp-status-reporter-library-1koqk09/)
