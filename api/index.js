const { buildResponse, extractBody } = require("./utils");
const { getUserByCredentials, saveResultsToDatabase, getResultById } = require("./database");
const { createToken, makeHash, authorize } = require("./auth");
const { countCorrectAnswers } = require("./responses");

module.exports.login = async (event) => {
  const { username, password } = extractBody(event);

  const hashedPass = makeHash(password);

  const user = await getUserByCredentials(username, hashedPass);

  if (!user) {
    return buildResponse(401, { error: 'Invalid credentials' });
  }

  const token = createToken(user.name, user._id);

  return buildResponse(200, { token });
}

module.exports.sendResult = async (event) => {
  const authResult = await authorize(event);
  if (authResult.statusCode === 401) return authResult;

  const { name, answers } = extractBody(event);

  const result = countCorrectAnswers(name, answers);

  const insertedId = await saveResultsToDatabase(result);

  return buildResponse(201, {
    resultId: insertedId,
    __hypermedia: {
      href: `/results.html`,
      query: { id: insertedId }
    }
  });
};

module.exports.getResult = async (event) => {
  const authResult = await authorize(event);
  if (authResult.statusCode === 401) return authResult;

  const result = await getResultById(event.pathParameters.id); // não é necessário verificar se o parâmetro `id` existe, pois o Serverless se encarrega de executar este método (`getResult`) apenas se o path do arquivo YAML foi correspondido

  if (!result) {
    return buildResponse(404, { error: 'Result not found' });
  }

  return buildResponse(200, result);
}
