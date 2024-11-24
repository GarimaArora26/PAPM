sap.ui.define(["sap/m/MessageToast"], function (MessageToast) {
  'use strict';

  var requestUrl = "http://ip-api.com/json";

  $.ajax({
    url: requestUrl,
    type: 'GET',
    success: function (json) {
      console.log("My country is: " + json.country);
    },
    error: function (err) {
      console.log("Request failed, error= " + err);
    }
  });
});
