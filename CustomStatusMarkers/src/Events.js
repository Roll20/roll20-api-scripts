(() => {
  'use strict';

  const statusListeners = {
    'add': [],
    'change': [],
    'remove': []
  };

  /**
   * Functions for handling Custom Status Markers events.
   */
  CustomStatusMarkers.Events = class {
    /**
     * Fires an 'add' custom status markers event.
     * @param {string} event
     * @param {Graphic} token
     * @param {StatusMarker} marker
     */
    static fireAddEvent(token, marker) {
      let handlers = statusListeners.add;
      _.each(handlers, handler => {
        handler(token, _.clone(marker));
      });
    }

    /**
     * Fires a 'change' custom status markers event.
     * @param {string} event
     * @param {Graphic} token
     * @param {StatusMarker} marker
     */
    static fireChangeEvent(token, marker) {
      let handlers = statusListeners.change;
      _.each(handlers, handler => {
        handler(token, _.clone(marker));
      });
    }

    /**
     * Fires a 'remove' custom status markers event.
     * @param {string} event
     * @param {Graphic} token
     * @param {StatusMarker} marker
     */
    static fireRemoveEvent(token, marker) {
      let handlers = statusListeners.remove;
      _.each(handlers, handler => {
        handler(token, _.clone(marker));
      });
    }

    /**
     * Registers a Custom Status Markers event handler.
     * Each handler takes a token and a StatusMarker as parameters.
     * The following events are supported: 'add', 'change', 'remove'
     * @param {string} event
     * @param {function} handler
     */
    static on(event, handler) {
      if(statusListeners[event])
        statusListeners[event].push(handler);
    }

    /**
     * Removes a custom status marker event handler.
     * @param {string} event
     * @param {function} handler
     */
    static un(event, handler) {
      let handlers = statusListeners[event];
      if(handlers) {
        let index = handlers.indexOf(handler);
        if(index !== -1)
          handlers.splice(index, 1);
      }
    }
  };
})();
