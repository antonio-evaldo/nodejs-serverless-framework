const token = window.localStorage.getItem('token');

if (!token) {
  window.location.href = '/login.html';
}

const queryString = new URLSearchParams(window.location.search)
const resultId = queryString.get('id')

const bail = () => {
  alert('Nenhum resultado encontrado')
  // window.location = '/'
}

if (!resultId) bail()

fetch(`https://htfvd3heo2.execute-api.us-east-1.amazonaws.com/api/results/${resultId}`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
}).then((r) => {
    if (!r.ok) bail()
    return r.json()
  })
  .then((result) => {
    document.getElementById('student-name').innerText = result.name
    document.getElementById('correct').innerText = result.totalCorrectAnswers
  })
  .catch((e) => {
    console.error(e)
    bail()
  })
