# Siemens SPC Notify Email

Send SIA events from Siemens SPC intrusion alarm by push mail.

<b>NOTE!</b> To be able to use this module you also need to have SPC Web Gateway from [Lundix IT](http://www.lundix.se/smarta-losningar). SPC Web Gateway is providing a generic open REST and Websocket interface to Siemens SPC intrusion system.

## Installation
      
	git clone https://github.com/Goran58/node-spc-notify-email
	cd node-spc-notify-email
	npm install
	
## Configuration

- Modify the settings in config.json according to your environment and email account
- Adapt the function manageSiaEvent() to the SIA-events you would like to be managed. Look in the SPC documentation for definitions of the SIA event types.

## Start
	./node-spc-notify-email.js
