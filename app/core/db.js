const mongoose = require("mongoose");

function startDataBase() {
	return new Promise((resolve, reject) => {
		//Database
		const uri = config.database.url;
		mongoose.set('useUnifiedTopology', true);
		mongoose.set('useNewUrlParser', true);
		mongoose.set('useFindAndModify', false);
		mongoose.set('useCreateIndex', true);
		mongoose.connect(uri)
			.then(() => {
				console.log("💪 connected to DB.");
				resolve();
			})
			.catch(err => {
				console.log(err);
				reject(err);
			});
	});
}

async function stopDatabase() {
	try {
		await mongoose.disconnect();
	} catch (error) { }
}

module.exports = {
	startDataBase,
	stopDatabase
};