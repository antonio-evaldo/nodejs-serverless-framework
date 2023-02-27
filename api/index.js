const { MongoClient, ObjectId } = require("mongodb");

async function connectToDatabase() {
  const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);

  const connection = await client.connect();

  return connection.db(process.env.MONGODB_DB_NAME);
}

function extractBody(event) {
  if (!event?.body) {
    return {
      statusCode: 422,
      body: JSON.stringify({ error: 'Missing body' })
    }
  }

  return JSON.parse(event.body);
}

module.exports.sendResponse = async (event) => {
  const { name, answers } = extractBody(event);

  const correctQuestions = [3, 1, 0, 2]

  const totalCorrectAnswers = answers.reduce((acc, answer, index) => {
    if (answer === correctQuestions[index]) {
      acc++
    }
    return acc
  }, 0)

  const result = {
    name,
    answers,
    correctAnswers: totalCorrectAnswers,
    totalAnswers: answers.length
  }

  const db = await connectToDatabase();
  const collection = db.collection('results');

  const { insertedId } = await collection.insertOne(result);

  return {
    statusCode: 201,
    body: JSON.stringify({
      resultId: insertedId,
      __hypermedia: {
        href: `/results.html`,
        query: { id: insertedId }
      }
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }
};

module.exports.getResult = async (event) => {
  const db = await connectToDatabase();
  const collection = db.collection('results');

  const result = await collection.findOne({
    _id: new ObjectId(event.pathParameters.id)
  }) // não é necessário verificar se esse parâmetro existe, pois o serverless se encarrega de executar este método apenas se o path do arquivo YAML foi correspondido

  if (!result) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Result not found' }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: {
      'Content-Type': 'application/json'
    }
  }
}
