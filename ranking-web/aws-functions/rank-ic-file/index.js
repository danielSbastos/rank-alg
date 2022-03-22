const rank = (i, j, c) => {
  let n, d;

  if (i < j) {
    n = (i - j)*(j + 1);
  } else {
    n = (i - j)*(j + 1)*c;
  }

  d = (j + 1);


  return [n, d]
}


const rankData = (metadata, candidates) => {
  const ranks = {}
  let attrId, attrVal, i, j, c, n, d
  candidates.forEach((candidate, idx) => {
    n = d = 0

    Object.entries(candidate).forEach(item => {
      attrId = item[0]
      attrVal = item[1]
      i = attrVal / metadata[attrId].n
      j = metadata[attrId].value / metadata[attrId].n
      c = metadata[attrId].merit ? 1 : 0

      const result = rank(i, j, c)
      d += result[1]
      n += result[0]
    })

    ranks[idx + 1] = n/d
  })

  return ranks
}


data = `@metadados
numAspectos 4
niveisPorAspecto 3 2 2 5
meritos True False True True

@candidatoDesejado
nivel 2 1 1 3

@candidatos
nivel 2 1 1 3
nivel 2 1 1 3
nivel 2 1 1 3
nivel 2 1 1 3
nivel 2 1 1 3`


function removeEmpt (arr) { return arr.filter(element => {
  return element !== '';
})};


function getMetadata(meta) {
    let hash = {}
    let numAttr = parseInt(meta[0].replace('numAspectos ',''));
    let levelsAttr = meta[1].replace('niveisPorAspecto ', '').split(' ')
    let merits = meta[2].replace('meritos ', '').split(' ')

    for (i = 0; i < parseInt(numAttr); i++) {
        hash[i+1] = { n: parseInt(levelsAttr[i]) - 1, merit: (merits[i] === 'True' || merits[i] === 'true') }
    }
    return [hash, numAttr]
}

function getIdealCandidate(ideal, hash, n) {
    let values = ideal[0].replace('nivel ', '').split(' ');
    for (i = 0; i < n; i++) {
        hash[i+1].value = parseInt(values[i])
    }
    return hash
}

function getCandidates(candidates, n) {
    let cands = []
    let value, hash
    candidates.forEach(candidate => {
      values = candidate.replace('nivel ', '').split(' ')
      hash = {}
      for (i = 0; i < n; i++) {
        hash[i+1] = parseInt(values[i])
      }
      cands.push(hash)
    })

    return cands
}



const multipart = require("parse-multipart");
const csv = require("csvtojson");

exports.handler = async event => {
    const body = Buffer.from(event["content"].toString(), "base64");
    const headers = event["headers"]["content-type"];
    const boundary = multipart.getBoundary(headers);
    const buff = multipart.Parse(body, boundary);
    const csvDataString = buff[0].data.toString("utf8");

    const splited = csvDataString.split('@')
    const metadata = removeEmpt(splited[1].split('\n').slice(1))
    const idealCandidate = removeEmpt(splited[2].split('\n').slice(1))
    const candidates = removeEmpt(splited[3].split('\n').slice(1))

    const info = getMetadata(metadata)
    const infoMetaIdeal = getIdealCandidate(idealCandidate, info[0], info[1])
    const infoCandidates = getCandidates(candidates, info[1])

    const ranks = rankData(infoMetaIdeal, infoCandidates)

    return {
        'statusCode': 200,
        'body': ranks
    }
}

