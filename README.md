# Hetzner DNS Updater
Tool to automatically update an A Record with the Hetzner DNS API when the public IP-Adress changes.

API Docs: https://dns.hetzner.com/api-docs/

##
### What is this script doing?
This script checks every 6 hours if the public IP-Adress has changed, if yes a configured A Record will be updated with the new IP-Adress.

### Who should use this software?
Anyone who has a non-static IP-Adress that needs to have a working DNS Record.

##
### Installation
#### NOTE: PLEASE LEAVE THE `credentials.json` & `adress.json` UNTOUCHED. Those files are needed to make the script run properly!

1. Download the source code
2. Create an API token [here](https://dns.hetzner.com/settings/api-token) and save it directly in the `config.json` file (Replace the URL with your token)
3. Install all required packages with `npm i`
4. Run the `setup.js` with `npm run setup` and follow it's instructions
5. Run the main script with `node .`
6. Extra Steps: Run the software in a screen on a raspberry pi and configure it as a service. Read [here](https://medium.com/@benmorel/creating-a-linux-service-with-systemd-611b5c8b91d6) for more information about adding a service

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/A0A17PL0D)
