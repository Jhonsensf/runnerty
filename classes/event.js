"use strict";

var logger            = require("../libs/utils.js").logger;
var loadConfigSection = require("../libs/utils.js").loadConfigSection;
var requireDir        = require('require-dir');
var notificators      = requireDir('../notificators');

class Event {
  constructor(name, process, notifications){

    return new Promise((resolve) => {
        this.loadEventsObjects(name, process, notifications)
        .then((events) => {
        resolve(events);
        })
        .catch(function(e){
            logger.log('error','Event constructor '+e);
            resolve();
          });
        });
  }

  loadNotificationConfig(notification){
    return new Promise((resolve) => {
        loadConfigSection(global.config, 'notificators', notification.id)
        .then((config) => {
         notification.config = config;
         resolve(notification);
        })
        .catch(function(e){
            logger.log('error','loadNotificationConfig'+e);
            resolve(notification);
          });
        });
  }

  loadEventsObjects(name, process, notifications) {
    var _this = this;
    return new Promise((resolve) => {
      var objEvent = {};
      objEvent[name] = {};

      if (notifications instanceof Array) {
        var notificationsLength = notifications.length;
        if (notificationsLength > 0) {

          var notificationsPromises = [];

          while (notificationsLength--) {
            var notification = notifications[notificationsLength];
           _this.loadNotificationConfig(notification)
             .then(function (notificationAndConfig) {

               var type = notificationAndConfig.config.type;

               notificationsPromises.push(new notificators[type](notificationAndConfig));

               Promise.all(notificationsPromises)
                 .then(function (res) {
                   objEvent[name]['notifications'] = res;
                   resolve(objEvent);
                 })
                 .catch(function(e){
                   logger.log('error','Event loadEventsObjects: '+e);
                   resolve(objEvent);
                 });

             })
             .catch(function(err){
               logger.log('error','Event loadNotificationConfig: '+err);
             });
          }

        } else {
          logger.log('error','Event loadEventsObjects: '+e);
          resolve(objEvent);
        }
      } else {
        logger.log('error','Notifications, is not array', name, process, notifications);
        resolve(objEvent);
      }
  });
  }
}

module.exports = Event;