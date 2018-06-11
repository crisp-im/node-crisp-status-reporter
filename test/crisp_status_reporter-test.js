/*
 * node-crisp-status-reporter
 *
 * Copyright 2018, Crisp IM SARL
 * Author: Valerian Saliou <valerian@valeriansaliou.name>
 */


"use strict";


var CrispStatusReporter = require("../").CrispStatusReporter;
var assert = require("assert");


describe("crisp-status-reporter", function() {
  describe("constructor", function() {
    it("should succeed creating an instance with valid options", function() {
      assert.doesNotThrow(
        function() {
          new CrispStatusReporter({
            token      : "REPLACE_THIS_WITH_A_SECRET_KEY",
            service_id : "d657b4c1-dd07-4f94-ac7a-d4c3b4b219c1",
            node_id    : "5eca824b-4134-4126-982d-2c2338ecf3ab",
            replica_id : "192.168.1.10",
            interval   : 30,
            console    : require("console")
          });
        },

        "CrispStatusReporter should not throw on valid options"
      );
    });

    it("should fail creating an instance with missing token", function() {
      assert.throws(
        function() {
          new CrispStatusReporter({
            service_id : "d657b4c1-dd07-4f94-ac7a-d4c3b4b219c1",
            node_id    : "5eca824b-4134-4126-982d-2c2338ecf3ab",
            replica_id : "192.168.1.10"
          });
        },

        "CrispStatusReporter should throw on missing token"
      );
    });

    it("should fail creating an instance with missing service_id", function() {
      assert.throws(
        function() {
          new CrispStatusReporter({
            token      : "REPLACE_THIS_WITH_A_SECRET_KEY",
            node_id    : "5eca824b-4134-4126-982d-2c2338ecf3ab",
            replica_id : "192.168.1.10"
          });
        },

        "CrispStatusReporter should throw on missing service_id"
      );
    });

    it("should fail creating an instance with invalid node_id", function() {
      assert.throws(
        function() {
          new CrispStatusReporter({
            token      : "REPLACE_THIS_WITH_A_SECRET_KEY",
            service_id : "d657b4c1-dd07-4f94-ac7a-d4c3b4b219c1",
            replica_id : "192.168.1.10"
          });
        },

        "CrispStatusReporter should throw on invalid node_id"
      );
    });

    it("should fail creating an instance with invalid replica_id",
      function() {
        assert.throws(
          function() {
            new CrispStatusReporter({
              token      : "REPLACE_THIS_WITH_A_SECRET_KEY",
              service_id : "d657b4c1-dd07-4f94-ac7a-d4c3b4b219c1",
              node_id    : "5eca824b-4134-4126-982d-2c2338ecf3ab"
            });
          },

          "CrispStatusReporter should throw on invalid replica_id"
        );
      }
    );
  });

  describe("reporter", function() {
    it("should report metrics after a few seconds", function(done) {
      this.timeout(20000)

      var crispStatusReporter = new CrispStatusReporter({
        token      : "REPLACE_THIS_WITH_A_SECRET_KEY",
        service_id : "d657b4c1-dd07-4f94-ac7a-d4c3b4b219c1",
        node_id    : "5eca824b-4134-4126-982d-2c2338ecf3ab",
        replica_id : "192.168.1.10",
        console    : require("console")
      });

      setTimeout(function() {
        assert.equal(
          crispStatusReporter.end(), true, "Reporter should be ended"
        );

        done();
      }, 15000);
    });
  });
});
