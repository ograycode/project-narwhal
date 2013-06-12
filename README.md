project-narwhal
===============

Continuous Integration service for NodeJs, written in NodeJs

Features
--------
1. Github integration
2. Email audit records
3. Light-weight

Settings
--------
Edit settings.js with your username and password for SendGrid to enable emailing of audit records.
Inside data.js, place your couchdb information.

Ports currently used are 3005 and 3010. In addition, you will need Forever installed, as well as a proxy service to transfer your request to an alive instance of your server. This can be done in many ways, to include a seperated NodeJs listener, Nginx, etc.

This project was built at a hackathon, so excuse its hackyness. 
