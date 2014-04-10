/**
 * frameapp.js
 *
 * The FrameApp object is a lightweight Javascript object intended to mock the `postMessage` endpoint for Embedded Apps
 * in the Shopify Admin panel. Eventually, we hope to mock all of the functionality provided by the Shopify Embedded App
 * SDK.
 */
(function() {

  window.FrameApp = (function() {

    FrameApp.name = 'Shopify Dev Frame';

    function FrameApp() {}


    /* Initialisation, configuration and helpers.
		================================================== */

    /**
     * Initialise the FrameApp - load configuration, set up event handlers.
     *
     * @param config
     * @returns {*}
     */
    FrameApp.init = function(config) {
      var _this = this;
      if (config == null) {
        config = {};
      }
      this.loadConfig(config);

      // Use addEventListener if available, otherwise fall back to attachEvent.
      if (window.addEventListener) {
        this.iframe.addEventListener("load", FrameApp.__iframeLoadCallback, false);
        return window.addEventListener("message", FrameApp.__addEventMessageCallback, false);
      }

      this.iframe.attachEvent("load", FrameApp.__iframeLoadCallback);
      return window.attachEvent("onMessage", FrameApp.__addEventMessageCallback);
    };

    /**
     * Load configuration for the FrameApp. Set defaults if not provided.
     * @param config
     */
    FrameApp.loadConfig = function(config) {
      this.shopOrigin = config.shopOrigin;
      this.debug = !!config.debug;
      this.iframe = config.iframe;
      if (!this.iframe) {
        this.log("FrameApp error: no <iframe> specified.");
      }
      FrameApp.log('FrameApp configuration loaded.');
    };

    /**
     * Log a message to the console, if the app was configured in debug mode.
     *
     * @param message
     * @param force
     * @returns {*}
     */
    FrameApp.log = function(message, force) {
      if ((typeof console !== "undefined" && console !== null ? console.log : void 0) && (this.debug || force)) {
        return console.log(message);
      }
    };


    /* Message sending and event handling.
		================================================== */

    FrameApp.__messageHandlers = {};

    /**
     * Post a message to the <iframe>.
     *
     * @param message
     * @param data
     * @returns {*}
     */
    FrameApp.postMessage = function(message, data) {
      var json;
      json = JSON.stringify({
        message: message,
        data: data
      });
      FrameApp.log("FrameApp client sent " + json + " to ShopifyApp.");
      return this.iframe.contentWindow.postMessage(json, '*');
    };

    /**
     * Add a handler for a received message.
     *
     * @param message
     * @param fn
     * @returns {Number|*}
     * @private
     */
    FrameApp.__addMessageHandler = function(message, fn) {
      if (typeof message === "function") {
        fn = message;
        message = void 0;
      }
      if (!FrameApp.__messageHandlers[message]) {
        FrameApp.__messageHandlers[message] = [];
      }
      return FrameApp.__messageHandlers[message].push(fn);
    };

    /**
     * Callback triggered when a postMessage message is received.
     *
     * @param e
     * @returns {*}
     * @private
     */
    FrameApp.__addEventMessageCallback = function(e) {
      var handler, handlers, message, submitForm, _i, _len;
      FrameApp.log("FrameApp client received " + e.data + " from " + e.origin);
      message = JSON.parse(e.data);
      handlers = [];
      if (FrameApp.__messageHandlers[message.message]) {
        handlers = handlers.concat(FrameApp.__messageHandlers[message.message]);
      }
      if (FrameApp.__messageHandlers[void 0]) {
        handlers = handlers.concat(FrameApp.__messageHandlers[void 0]);
      }
      for (_i = 0, _len = handlers.length; _i < _len; _i++) {
        handler = handlers[_i];
        handler(message.message, message.data);
      }
    };

    /**
     * Callback triggered when our iFrame is loaded.
     *
     * @param e
     * @private
     */
    FrameApp.__iframeLoadCallback = function(e) {
      FrameApp.postMessage('Shopify.API.initialize', {
        'hi': 'there!'
      });
    };

    return FrameApp;

  }).call(this);

}).call(this);