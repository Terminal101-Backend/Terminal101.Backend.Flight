const { createClient } = require("redis");
const { redis: url } = require("../../config/database");
const client = createClient({ url });

client.on('error', (err) => console.log('Redis Client Error', err));

async function startDatabase() {
	await client.connect();
}

async function stopDatabase() {
	await client.quit();
}

module.exports = {
	client,
	startDatabase,
	stopDatabase
};