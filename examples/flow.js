/*
 * node-crisp-status-reporter
 *
 * Copyright 2018, Crisp IM SAS
 * Author: Valerian Saliou <valerian@valeriansaliou.name>
 */


"use strict";


var console              = require("console");

var CrispStatusReporter  = require("../").CrispStatusReporter;


// 1. Create Crisp Status Reporter
console.info("Creating Crisp Status Reporter...");

var crispStatusReporter = new CrispStatusReporter({
  token      : "REPLACE_THIS_WITH_A_SECRET_KEY",
  service_id : "d657b4c1-dd07-4f94-ac7a-d4c3b4b219c1",
  node_id    : "5eca824b-4134-4126-982d-2c2338ecf3ab",
  replica_id : "192.168.1.10",
  interval   : 30,
  console    : console
});

console.info("Created Crisp Status Reporter");


// 2. Schedule Crisp Status Reporter end
setTimeout(function() {
  console.info("Ending Crisp Status Reporter...");

  if (crispStatusReporter.end() === true) {
    console.info("Ended Crisp Status Reporter");
  } else {
    console.warn("Could not end Crisp Status Reporter");
  }
}, 80000);
