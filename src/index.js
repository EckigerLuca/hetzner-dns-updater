const axios = require("axios");
const fs = require("fs");
const config = require("./data/config.json");
const credentials = require("./data/credentials.json")
const cron = require('node-cron');

axios.defaults.headers.common["Auth-API-Token"] = config.apiToken;
axios.defaults.headers.common["Content-Type"] = "application/json";

async function currentIpCheck() {
	const response = await axios.get("https://api.ipify.org/?format=json");
	const ipAdress = await response.data.ip;
	return await ipAdress;
}

async function ipComparison() {
	const adressJsonRaw = fs.readFileSync('./src/data/adress.json', { encoding: "utf-8"});
	const adressJson = JSON.parse(adressJsonRaw);

	const oldAdress = adressJson.ip;
	const newAdress = await currentIpCheck();

	console.log("Old adress:", oldAdress);
	console.log("New adress:", newAdress);

	if (oldAdress !== newAdress) {
		console.log("\nNew adress found!\nChecking current DNS Record Value...\n");

		const recordResponse = await axios.get(`https://dns.hetzner.com/api/v1/records/${credentials.recordId}`)
							.catch(function (error) {
								if (error.response) {
									console.error(`Could not find a valid record. Please re-run the setup script with "npm run setup"!`)
									return process.exit(1);
								}
							})
		
		const record = recordResponse.data.record;

		if (newAdress == record.value) return console.log("New IP already matching the record's value.")

		console.log('Proceed to update DNS Record...\n')

		await axios.put(`https://dns.hetzner.com/api/v1/records/${credentials.recordId}`, {
			"value": newAdress,
			"ttl": 86400,
			"type": "A",
			"name": record.name,
			"zone_id": credentials.zoneId
		}).catch(function (error) {
			if (error.response) {
				console.error("There was an error while updating the record:");
				return console.error(error);
			}
		})

		const toJson = {
			"ip": newAdress,
		};
		fs.writeFile('./src/data/adress.json', JSON.stringify(toJson, null, 4), 'utf-8', function writeFileCallback(err) {
			if (err) console.log(err);
		});

		console.log("Updated DNS Record. Saved it locally.\n\n")
		

	} else {
		return console.log("\nNo new adress...\n");
	}
}

async function main() {
	console.log("Started script...\n");
	await ipComparison();
	console.log("\nNow running every 6 hours again...\n")

	cron.schedule('0 */6 * * *', async () => {
		console.log("\nStarted cron job\n");
		await ipComparison();
	})
}

main();