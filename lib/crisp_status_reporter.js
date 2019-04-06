/*
 * node-crisp-status-reporter
 *
 * Copyright 2018, Crisp IM SARL
 * Author: Valerian Saliou <valerian@valeriansaliou.name>
 */


"use strict";


var url  = require("url");
var os   = require("os");
var v8   = require("v8");


var REPORT_URL      = "https://report.crisp.watch/v1";
var REQUEST_TIMEOUT = 10000;


/**
 * CrispStatusReporter
 * @class
 * @classdesc  Instanciates a new Crisp Status Reporter connector.
 * @param      {object} options
 */
var CrispStatusReporter = function(options) {
  var self = this;

  // Sanitize options
  if (typeof options !== "object") {
    throw new Error("Invalid or missing options");
  }

  ["token", "service_id", "node_id", "replica_id"].forEach(function(type) {
    if (typeof options[type] !== "string") {
      throw new Error("Invalid or missing options." + type);
    }
  });

  // Apply defaults
  if (typeof options.interval !== "number" || !options.interval) {
    options.interval = 30;
  }

  // Storage space
  this.__options           = {
    token                 : options.token,

    service_id            : options.service_id,
    node_id               : options.node_id,
    replica_id            : options.replica_id,

    interval_seconds      : options.interval,
    interval_milliseconds : (options.interval * 1000),

    console               : (options.console || null)
  };

  // Parse package data
  var package_data = require(__dirname + "/../package.json");

  // Build HTTP parameters
  this.__http_library      = (
    REPORT_URL.startsWith("https") ? require("https") : require("http")
  );

  this.__http_url          = url.parse(REPORT_URL);

  this.__http_request      = {
    host    : this.__http_url.hostname,
    port    : this.__http_url.port,

    path    : (
      this.__http_url.pathname + "/report/" +
        encodeURIComponent(this.__options.service_id) + "/" +
        encodeURIComponent(this.__options.node_id) + "/"
    ),

    method  : "POST",
    auth    : (":" + this.__options.token),
    timeout : REQUEST_TIMEOUT,

    headers : {
      "Content-Type" : "application/json; charset=utf-8",

      "User-Agent"   : (
        "node-" + package_data.name + "/" + package_data.version
      )
    }
  };

  this.__next_poll_timeout = null;

  // Start polling (after a 10s delay)
  this.__next_poll_timeout = setTimeout(function() {
    self.__next_poll_timeout = null;

    self.__scheduleTriggerPoll();
  }, 10000);
};


/**
 * CrispStatusReporter.prototype.end
 * @public
 * @param  {function} done
 * @return {boolean}  Whether was ended or not
 */
CrispStatusReporter.prototype.end = function(done) {
  // Stop polling?
  if (this.__next_poll_timeout !== null) {
    clearTimeout(this.__next_poll_timeout);

    this.__next_poll_timeout = null;

    return true;
  }

  return false;
};


/**
 * CrispStatusReporter.prototype.__scheduleTriggerPoll
 * @private
 * @return {undefined}
 */
CrispStatusReporter.prototype.__scheduleTriggerPoll = function() {
  this.__log(
    "log", "Scheduled poll request trigger"
  );

  // Trigger this poll
  this.__dispatchPollRequest(this.__deferNextTriggerPoll.bind(this));
};


/**
 * CrispStatusReporter.prototype.__deferNextTriggerPoll
 * @private
 * @param  {boolean} retry_failed
 * @return {undefined}
 */
CrispStatusReporter.prototype.__deferNextTriggerPoll = function(retry_failed) {
  var self = this;

  if (this.__next_poll_timeout === null) {
    if (retry_failed === true) {
      this.__log(
        "warn",
        ("Last request failed, scheduled next request sooner in " +
            (this.__options.interval_seconds / 2) + " secs")
      );
    } else {
      this.__log(
        "log",
        ("Scheduled next request in " + this.__options.interval_seconds +
            " secs")
      );
    }

    var poll_defer = (
      (retry_failed === true) ? (this.__options.interval_milliseconds / 2) :
        this.__options.interval_milliseconds
    );

    this.__next_poll_timeout = setTimeout(function() {
      self.__log(
        "log",
        ("Executing next request now (after wait of " + poll_defer + " ms)")
      );

      self.__next_poll_timeout = null;

      self.__scheduleTriggerPoll();
    }, poll_defer);
  }
};


/**
 * CrispStatusReporter.prototype.__dispatchPollRequest
 * @private
 * @param  {function} fn_next
 * @return {undefined}
 */
CrispStatusReporter.prototype.__dispatchPollRequest = function(fn_next) {
  var self = this;

  this.__log(
    "log", "Will dispatch request"
  );

  var abort_timeout = null;

  // Assign next processor
  var is_done_next = false;

  var fn_do_next = function(retry_failed) {
    // Not already done? Lock & proceed.
    if (is_done_next === false) {
      self.__log(
        "log", ("Running next poll method with retry failed: " + retry_failed)
      );

      is_done_next = true;

      // Stop abort timeout?
      if (abort_timeout !== null) {
        clearTimeout(abort_timeout);

        abort_timeout = null;
      }

      fn_next(retry_failed);
    }
  };

  // Acquire heap statistics
  var heap = v8.getHeapStatistics();

  // Build request data
  var request_data_raw = {
    replica_id : this.__options.replica_id,
    interval   : this.__options.interval_seconds,

    load       : {
      cpu : (os.loadavg()[0] / parseFloat(os.cpus().length || 1)),
      ram : ((heap.total_heap_size || 0.0) / (heap.heap_size_limit || 1.0))
    }
  };

  var request_data = JSON.stringify(request_data_raw);

  this.__log(
    "log", "Built request raw data", request_data_raw
  );

  // Build request parameters
  var request_params = Object.assign(
    {}, this.__http_request
  );

  request_params.headers["Content-Length"] = Buffer.byteLength(request_data);

  // Submit reporter request
  var request = this.__http_library.request(request_params, function(response) {
    response.setEncoding("utf8");

    if (response.statusCode !== 200) {
      self.__log(
        "error", "Failed dispatching request"
      );

      fn_do_next(true);
    } else {
      self.__log(
        "info", "Request succeeded", request_data_raw
      );

      fn_do_next(false);
    }
  });

  request.on("timeout", function() {
    self.__log(
      "warn", "Request timed out"
    );

    request.abort();
  });

  request.on("abort", function() {
    self.__log(
      "error", "Request aborted"
    );

    fn_do_next(true);
  });

  request.on("error", function(error) {
    self.__log(
      "error", "Request error", error
    );

    fn_do_next(true);
  });

  request.on("close", function() {
    self.__log(
      "log", "Request closed"
    );

    fn_do_next(false);
  });

  request.write(request_data);
  request.end();

  // Schedule hard timeout (in case request fails)
  abort_timeout = setTimeout(function() {
    abort_timeout = null;

    self.__log(
      "warn", "Hard timeout fired as request stalled"
    );

    fn_do_next(true);

    // Force a late abort
    request.abort();
  }, (REQUEST_TIMEOUT + 1000));
};


/**
 * CrispStatusReporter.prototype.__log
 * @private
 * @param  {string} level
 * @param  {string} message
 * @param  {object} data
 * @return {undefined}
 */
CrispStatusReporter.prototype.__log = function(level, message, data) {
  if (this.__options.console !== null && this.__options.console[level]) {
    var log_message = ("Crisp Status Reporter: " + message);

    if (data !== undefined) {
      this.__options.console[level](log_message, data);
    } else {
      this.__options.console[level](log_message);
    }
  }
};


exports.CrispStatusReporter = CrispStatusReporter;
