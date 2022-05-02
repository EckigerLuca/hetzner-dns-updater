const axios = require("axios");
const fs = require("fs");
const config = require("./data/config.json");
const readlineSync = require("readline-sync");

axios.defaults.headers.common["Auth-API-Token"] = config.apiToken;

setup()

async function setup() {
	console.log("Welcome to the setup. In the following you will set up this tool to automatically update a DNS Record at Hetzner when your public IP-Adress changes.\n")

	if (!readlineSync.keyInYN(`Is "${config.apiToken}" your API-Token?`)) {
		return console.log("Please correct it in the config.json file.");
	}

	const domainName = readlineSync.question("Please enter the Domain Name (e.g. example.com): ");
	console.log("Getting Zone ID...");
	const zoneId = await getZoneId(domainName);
	console.log(`Successfully got Zone ID "${zoneId}" for "${domainName}"\n`);

	readlineSync.question("Have you already set up a record? Press enter if you already have, if not add it and then continue. At the moment only A records are supported. [Press enter to continue] ")
	const recordName = readlineSync.question("Please enter the name of the record WITHOUT the domain (e.g. home): ");
	console.log("Getting record ID...");
	const recordId = await getRecordId(zoneId, recordName);
	console.log(`Successfully got Record ID "${recordId}" for "${recordName}.${domainName}"\n`)

	console.log("Saving data...")
	const toJson = {
		"zoneId": zoneId,
		"recordId": recordId,
	}
	fs.writeFile('./src/data/credentials.json', JSON.stringify(toJson, null, 4), 'utf-8', function writeFileCallback(err) {
		if (err) console.log(err);
	});
	console.log(`Successfully set up everything important for this tool. You can now run the "index.js" via "node ." or "npm run start".\nRe-Run this script whenever you need to change the configuration. Please leave the "credentials.json" file untouched unless you know what to do ;)`);
}

async function getZoneId(domainName) {
	const response = await axios.get("https://dns.hetzner.com/api/v1/zones");
	const data = await response.data.zones;

	let zone;
	for (i=0; i<data.length; i++) {
		if (data[i].name == domainName) {
			zone = data[i];
		}
	}

	if (zone == undefined) {
		console.error(`Could not find the domain "${domainName}" in your domains!`);
		return process.exit(9);
	}
	return zone.id;
}

async function getRecordId(zoneId, recordName) {
	const response = await axios.get(`https://dns.hetzner.com/api/v1/records?zone_id=${zoneId}`);
	const data = await response.data.records;

	let record;
	for (i=0; i<data.length; i++) {
		if (data[i].name == recordName) {
			record = data[i];
		}
	}

	if (record == undefined) {
		console.error(`Could not find the record "${recordName}" for the domain.`);
		return process.exit(9);
	}
	if (record.type !== "A") {
		console.error(`Invalid record type. Only A records are supported.`);
		return process.exit(9);
	}
	return record.id;
}