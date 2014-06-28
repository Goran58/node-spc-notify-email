#!/usr/bin/env node
/*
* SPC notify template
*/
/* Accept self signed certificate */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var config = require('./config.json');

var websocket_client = require('websocket').client;
var email = require('emailjs')

// Connect to spc_web_gateway websocket interface
var ws_client = new websocket_client();
ws_client.connect(config['spc_gw_ws'] + '/ws/spc' + config['auth']);

ws_client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

ws_client.on('connect', function(connection) {
    console.log('SPC WebSocket client connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            manageSiaEvent(message.utf8Data);
        }
    });
});

/**********************************************************************
* manageSiaEvent
**********************************************************************/
function manageSiaEvent(message){
    data = JSON.parse(message);
    if (data['status'] === 'success'){ 
        timestamp = data['data']['sia'].timestamp;
        sia_code = data['data']['sia'].sia_code;
        sia_address = data['data']['sia'].sia_address;
        description = data['data']['sia'].description;
        flags = data['data']['sia'].flags;
        verification_id = data['data']['sia'].verification_id;

        // Convert timestamp to milliseconds and repack json string
        json = JSON.stringify(data['data']['sia']);

        // Filter SIA events 
        switch (sia_code){
            case 'BA': /* Burglar Alarm */
            case 'BR': /* Burglar Alarm Restore */
            case 'BB': /* Inhibited or Isolated */
            case 'BU': /* Deinhibited or Deisolated */
            case 'CL': /* Area Activated (Full Set) */
            case 'NL': /* Area Activated (Part Set)  */
            case 'OP': /* Area Deactivated */
            case 'ZC': /* Zone Closed */
            case 'ZO': /* Zone Opened */
                sendSiaEvent(json);
                break;
        }
    }
}

/**********************************************************************
* getTimeString - Convert timestamp to string format
**********************************************************************/
function getTimeString(seconds){
    var d = new Date(seconds*1000);
    var timestr = ( d.getFullYear() + '-' + 
                ('0' + (d.getMonth() + 1)).slice(-2) + '-' + 
                ('0' + d.getDate()).slice(-2) + ' ' +
                ('0' + d.getHours()).slice(-2) + ':' +
                ('0' + d.getMinutes()).slice(-2) + ':' +
                ('0' + d.getSeconds()).slice(-2));
    return timestr;
}
   
/**********************************************************************
* sendSiaEvent  - Format and send the SIA message
**********************************************************************/
function sendSiaEvent(json) {
    data = JSON.parse(json);
    var timestr = getTimeString(parseInt(data['timestamp']));
    var text = 'Date: ' + timestr + ' SPC Event: ' + data['sia_code'] + 
                   ' ' + data['description'];
    var subject = "My SPC SIA Event";

    console.log(subject + ":  " + text);
    mailMessage(subject, text);
}

/**********************************************************************
* mailMessage  - Mail the message 
**********************************************************************/
function mailMessage(subject, text){

   // Connect to Email server
   var server  = email.server.connect({
       user:    config['email_server_user'],
       password:config['email_server_password'],
       host:    config['email_server_host'],
       ssl:     config['email_server_ssl']
   });

   // Send message
   server.send({
      from:    config['email_from'],
      to:      config['email_to'],
      cc:      '',
      subject: subject,
      text:    text
   }, 
   function(err, message) { 
      if (err) {
         console.log(err);
      }
   });
}
