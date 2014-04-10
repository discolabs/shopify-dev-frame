(function() {

  window.ShopifyApp = (function() {

    ShopifyApp.name = 'ShopifyApp';

    function ShopifyApp() {}

    ShopifyApp.debug = false;

    ShopifyApp.forceRedirect = true;

    ShopifyApp.apiKey = "";

    ShopifyApp.shopOrigin = "";

    ShopifyApp.getWindowLocation = function() {
      return window.location;
    };

    ShopifyApp.setWindowLocation = function(location) {
      return window.location = location;
    };

    ShopifyApp.ready = function(fn) {
      return ShopifyApp.__addMessageHandler("Shopify.API.initialize", fn);
    };

    ShopifyApp.init = function(config) {
      var _this = this;
      if (config == null) {
        config = {};
      }
      this.loadConfig(config);
      this.checkFrame();
      ShopifyApp.__addMessageHandler("Shopify.API.initialize", function(message, data) {
        return ShopifyApp.pushState(_this.getWindowLocation().pathname + _this.getWindowLocation().search);
      });
      ShopifyApp.__addMessageHandler("Shopify.API.print", function(message, data) {
        window.focus();
        return ShopifyApp.print();
      });
      if (window.addEventListener) {
        return window.addEventListener("message", ShopifyApp.__addEventMessageCallback, false);
      } else {
        return window.attachEvent("onMessage", ShopifyApp.__addEventMessageCallback);
      }
    };

    ShopifyApp.checkFrame = function() {
      var redirectUrl;
      if (window === window.parent) {
        redirectUrl = "" + (ShopifyApp.shopOrigin || "https://myshopify.com") + "/admin/apps/";
        if (ShopifyApp.apiKey) {
          redirectUrl = redirectUrl + ShopifyApp.apiKey + ShopifyApp.getWindowLocation().pathname + (ShopifyApp.getWindowLocation().search || "");
        }
        if (ShopifyApp.forceRedirect) {
          ShopifyApp.log("ShopifyApp detected that it was not loaded in an iframe and is redirecting to: " + redirectUrl, true);
          return ShopifyApp.setWindowLocation(redirectUrl);
        } else {
          return ShopifyApp.log("ShopifyApp detected that it was not loaded in an iframe but redirecting is disabled! Redirect URL would be: " + redirectUrl, true);
        }
      }
    };

    ShopifyApp.loadConfig = function(config) {
      this.apiKey = config.apiKey;
      this.shopOrigin = config.shopOrigin;
      this.forceRedirect = config.hasOwnProperty('forceRedirect') ? !!config.forceRedirect : this.forceRedirect = true;
      this.debug = !!config.debug;
      if (!this.apiKey) {
        this.log("ShopifyApp warning: apiKey has not been set.");
      }
      if (!this.shopOrigin) {
        this.log("ShopifyApp warning: shopOrigin has not been set.");
      }
      if (this.shopOrigin && !this.shopOrigin.match(/^http(s)?:\/\//)) {
        return this.log("ShopifyApp warning: shopOrigin should include the protocol");
      }
    };

    ShopifyApp.log = function(message, force) {
      if ((typeof console !== "undefined" && console !== null ? console.log : void 0) && (this.debug || force)) {
        return console.log(message);
      }
    };

    ShopifyApp.messageSlug = function(prefix) {
      var characters, _i;
      characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      prefix = (prefix || "message") + "_";
      for (_i = 0; _i < 16; _i++) {
        prefix += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return prefix;
    };

    ShopifyApp.print = function() {
      return window.print();
    };

    ShopifyApp.window = function() {
      return window.parent.frames["app-iframe"];
    };

    ShopifyApp.postMessage = function(message, data) {
      var json;
      json = JSON.stringify({
        message: message,
        data: data
      });
      ShopifyApp.log("ShopifyApp client sent " + json + " to " + this.shopOrigin);
      return window.parent.postMessage(json, this.shopOrigin);
    };

    ShopifyApp.pushState = function(location) {
      return ShopifyApp.postMessage("Shopify.API.pushState", {
        location: location
      });
    };

    ShopifyApp.flashError = function(err) {
      return ShopifyApp.postMessage("Shopify.API.flash.error", {
        message: err
      });
    };

    ShopifyApp.flashNotice = function(notice) {
      return ShopifyApp.postMessage("Shopify.API.flash.notice", {
        message: notice
      });
    };

    ShopifyApp.redirect = function(location) {
      return ShopifyApp.postMessage("Shopify.API.redirect", {
        location: location
      });
    };

    ShopifyApp.Bar = {
      initialize: function(init) {
        init = ShopifyApp.__addDefaultButtonMessages(init);
        ShopifyApp.__addButtonMessageHandlers(init);
        ShopifyApp.postMessage("Shopify.API.Bar.initialize", init);
        return document.body.onclick = function() {
          return ShopifyApp.postMessage('Shopify.API.Bar.closeDropdown');
        };
      },
      loadingOn: function() {
        return ShopifyApp.postMessage("Shopify.API.Bar.loading.on");
      },
      loadingOff: function() {
        return ShopifyApp.postMessage("Shopify.API.Bar.loading.off");
      },
      setIcon: function(icon) {
        return ShopifyApp.postMessage("Shopify.API.Bar.icon", {
          icon: icon
        });
      },
      setTitle: function(title) {
        return ShopifyApp.postMessage("Shopify.API.Bar.title", {
          title: title
        });
      },
      setBreadcrumb: function(breadcrumb) {
        return ShopifyApp.postMessage("Shopify.API.Bar.breadcrumb", {
          breadcrumb: breadcrumb
        });
      },
      setPagination: function(pagination) {
        var init;
        init = ShopifyApp.__addDefaultButtonMessages({
          pagination: pagination
        });
        ShopifyApp.__addButtonMessageHandlers(init);
        return ShopifyApp.postMessage("Shopify.API.Bar.pagination", init);
      }
    };

    ShopifyApp.Modal = {
      __callback: void 0,
      __open: function(message, data, callback) {
        ShopifyApp.Modal.__callback = callback;
        return ShopifyApp.postMessage(message, data);
      },
      window: function() {
        return window.parent.frames["app-modal-iframe"];
      },
      open: function(init, callback) {
        init = ShopifyApp.__addDefaultButtonMessages(init);
        ShopifyApp.__addButtonMessageHandlers(init, true);
        return ShopifyApp.Modal.__open("Shopify.API.Modal.open", init, callback);
      },
      alert: function(message, callback) {
        return ShopifyApp.Modal.__open("Shopify.API.Modal.alert", {
          message: message
        }, callback);
      },
      confirm: function(message, callback) {
        return ShopifyApp.Modal.__open("Shopify.API.Modal.confirm", {
          message: message
        }, callback);
      },
      input: function(message, callback) {
        return ShopifyApp.Modal.__open("Shopify.API.Modal.input", {
          message: message
        }, callback);
      },
      close: function(result, data) {
        return ShopifyApp.postMessage("Shopify.API.Modal.close", {
          result: result,
          data: data
        });
      },
      setHeight: function(height) {
        return ShopifyApp.postMessage('Shopify.API.Modal.setHeight', {
          height: height
        });
      }
    };

    ShopifyApp.__messageHandlers = {};

    ShopifyApp.__modalMessages = [];

    ShopifyApp.__addDefaultButtonMessages = function(init) {
      var button, group, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (Array.isArray(init != null ? init.buttons : void 0)) {
        ShopifyApp.log("Deprecation: `buttons` should be defined as an object, not an array.", true);
        init.buttons = {
          secondary: init.buttons
        };
      }
      if (init != null ? init.primaryButton : void 0) {
        ShopifyApp.log("Deprecation: `primaryButton` should now be defined as `butttons.primary`.", true);
        init.buttons || (init.buttons = {});
        init.buttons.primary = [init.primaryButton];
        init.primaryButton = void 0;
      }
      if (init != null ? init.buttons : void 0) {
        _ref = ['primary', 'secondary', 'tertiary'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          group = _ref[_i];
          _ref1 = [].concat(init.buttons[group]);
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            button = _ref1[_j];
            if (button != null ? button.disabled : void 0) {
              ShopifyApp.log("Deprecation: `disabled` should now be defined as `style: 'disabled'`.", true);
              button.style = 'disabled';
            }
          }
        }
      }
      _ref2 = ['primary', 'secondary', 'tertiary'];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        group = _ref2[_k];
        this.__addDefaultButtonMessage((_ref3 = init.buttons) != null ? _ref3[group] : void 0, group);
        this.__addDefaultButtonMessageForLinks((_ref4 = init.buttons) != null ? _ref4[group] : void 0);
      }
      this.__addDefaultButtonMessage((_ref5 = init.pagination) != null ? _ref5.previous : void 0, "pagination_previous");
      this.__addDefaultButtonMessage((_ref6 = init.pagination) != null ? _ref6.next : void 0, "pagination_next");
      this.__addDefaultButtonMessage(init.breadcrumb, "breadcrumb");
      if (((_ref7 = init.pagination) != null ? (_ref8 = _ref7.previous) != null ? _ref8.href : void 0 : void 0) != null) {
        init.pagination.previous.target = 'app';
      }
      if (((_ref9 = init.pagination) != null ? (_ref10 = _ref9.next) != null ? _ref10.href : void 0 : void 0) != null) {
        init.pagination.next.target = 'app';
      }
      return init;
    };

    ShopifyApp.__addDefaultButtonMessage = function(buttonGroup, label) {
      var button, i, _i, _len;
      if (label == null) {
        label = 'button';
      }
      if (Array.isArray(buttonGroup)) {
        for (i = _i = 0, _len = buttonGroup.length; _i < _len; i = ++_i) {
          button = buttonGroup[i];
          if (!button.message) {
            button.message = ShopifyApp.messageSlug("button_" + label + "_" + i);
          }
        }
      } else if (buttonGroup != null) {
        if (!buttonGroup.message) {
          buttonGroup.message = ShopifyApp.messageSlug("button_" + label);
        }
      }
      return buttonGroup;
    };

    ShopifyApp.__addDefaultButtonMessageForLinks = function(buttonGroup) {
      var button, i, link, _i, _len, _results;
      if (!buttonGroup) {
        return;
      }
      if (Array.isArray(buttonGroup)) {
        _results = [];
        for (i = _i = 0, _len = buttonGroup.length; _i < _len; i = ++_i) {
          button = buttonGroup[i];
          _results.push(ShopifyApp.__addDefaultButtonMessageForLinks(button));
        }
        return _results;
      } else {
        button = buttonGroup;
        if (button.type === "dropdown") {
          return button.links = (function() {
            var _j, _len1, _ref, _results1;
            _ref = button.links;
            _results1 = [];
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              link = _ref[_j];
              _results1.push(this.__addDefaultButtonMessage(link, "link"));
            }
            return _results1;
          }).call(this);
        }
      }
    };

    ShopifyApp.__addButtonMessageHandlers = function(init, isModal) {
      var button, group, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
      if (init.buttons != null) {
        _ref = ['primary', 'secondary', 'tertiary'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          group = _ref[_i];
          if (init.buttons[group] != null) {
            if (Array.isArray(init.buttons[group])) {
              _ref1 = init.buttons[group];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                button = _ref1[_j];
                ShopifyApp.__addButtonMessageHandler(button, isModal);
                if (button.type === "dropdown") {
                  ShopifyApp.__addDropdownLinksMessageHandle(button);
                }
              }
            } else {
              ShopifyApp.__addButtonMessageHandler(init.buttons[group], isModal);
              if (init.buttons[group].type === "dropdown") {
                ShopifyApp.__addDropdownLinksMessageHandle(init.buttons[group]);
              }
            }
          }
        }
      }
      if (((_ref2 = init.pagination) != null ? _ref2.previous : void 0) != null) {
        ShopifyApp.__addButtonMessageHandler(init.pagination.previous, isModal);
      }
      if (((_ref3 = init.pagination) != null ? _ref3.next : void 0) != null) {
        ShopifyApp.__addButtonMessageHandler(init.pagination.next, isModal);
      }
      if (init.breadcrumb != null) {
        return ShopifyApp.__addButtonMessageHandler(init.breadcrumb, isModal);
      }
    };

    ShopifyApp.__addDropdownLinksMessageHandle = function(button) {
      var link;
      return button.links = (function() {
        var _i, _len, _ref, _results;
        _ref = button.links;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          link = _ref[_i];
          _results.push(ShopifyApp.__addButtonMessageHandler(link, false));
        }
        return _results;
      })();
    };

    ShopifyApp.__addButtonMessageHandler = function(button, isModal) {
      var _this = this;
      if (button.target === 'app') {
        button.callback = function(message, data) {
          return _this.setWindowLocation(button.href);
        };
      }
      if (typeof button.callback === "function") {
        ShopifyApp.__addMessageHandler(button.message, button.callback, isModal);
      }
      return button;
    };

    ShopifyApp.__addMessageHandler = function(message, fn, isModal) {
      if (typeof message === "function") {
        fn = message;
        message = void 0;
      }
      if (!ShopifyApp.__messageHandlers[message]) {
        ShopifyApp.__messageHandlers[message] = [];
      }
      if (isModal) {
        ShopifyApp.__modalMessages.push(message);
      }
      return ShopifyApp.__messageHandlers[message].push(fn);
    };

    ShopifyApp.__clearModalListeners = function() {
      ShopifyApp.__modalMessages.forEach(function(message) {
        return delete ShopifyApp.__messageHandlers[message];
      });
      return ShopifyApp.__modalMessages = [];
    };

    ShopifyApp.__addEventMessageCallback = function(e) {
      var handler, handlers, message, submitForm, _i, _len;
      ShopifyApp.log("ShopifyApp client received " + e.data + " from " + e.origin);
      message = JSON.parse(e.data);
      if (message.message === "Shopify.API.Modal.close" && ShopifyApp.Modal.__callback) {
        ShopifyApp.__clearModalListeners();
        ShopifyApp.Modal.__callback(message.data.result, message.data.data);
      }
      handlers = [];
      if (ShopifyApp.__messageHandlers[message.message]) {
        handlers = handlers.concat(ShopifyApp.__messageHandlers[message.message]);
      }
      if (ShopifyApp.__messageHandlers[void 0]) {
        handlers = handlers.concat(ShopifyApp.__messageHandlers[void 0]);
      }
      for (_i = 0, _len = handlers.length; _i < _len; _i++) {
        handler = handlers[_i];
        handler(message.message, message.data);
      }
      if (submitForm = document.querySelector("form[data-shopify-app-submit=\"" + message.message + "\"]")) {
        submitForm.submit();
      }
    };

    return ShopifyApp;

  }).call(this);

}).call(this);