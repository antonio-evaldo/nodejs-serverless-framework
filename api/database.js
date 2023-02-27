const { MongoClient, ObjectId } = require("mongodb");

let connectionInstance = null;

async function connectToDatabase() {
  if (connectionInstance) return connectionInstance;

  const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);

  const connection = await client.connect();

  connectionInstance = connection.db(process.env.MONGODB_DB_NAME);

  return connectionInstance;
}

async function getUserByCredentials(username, hashedPass) {
  const db = await connectToDatabase();
  const collection = db.collection('users');

  const user = await collection.findOne({ name: username, password: hashedPass });

  return user;
}

async function saveResultsToDatabase(results) {
  const db = await connectToDatabase();
  const collection = db.collection('results');

  const { insertedId } = await collection.insertOne(results);

  return insertedId;
}

async function getResultById(id) {
  const db = await connectToDatabase();
  const collection = db.collection('results');

  const result = await collection.findOne({ _id: new ObjectId(id) });

  return result;
}

module.exports = {
  connectToDatabase,
  getUserByCredentials,
  saveResultsToDatabase,
  getResultById
};