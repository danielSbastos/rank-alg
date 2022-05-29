const multipart = require("parse-multipart");

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

const scaleMapping = {
  2: { NaoSabe: 1, Sabe: 2 },
  3: { NaoSabe: 1, Basico: 2, Intermediario: 3 },
  4: { NaoSabe: 1, Basico: 2, Intermediario: 3, Avancado: 4 }
}

const rankData = (metadata, candidates) => {
  const ranks = []
  let attrId, attrVal, i, j, c, n, d
  candidates.forEach((candidate, idx) => {
    n = d = 0

    Object.entries(candidate).forEach(item => {
      attrId = item[0]
      attrVal = item[1]
      i = (attrVal - 1) / (metadata[attrId].n - 1)
      j = (metadata[attrId].value - 1) / (metadata[attrId].n - 1)
      c = metadata[attrId].merit ? 1 : 0

      const result = rank(i, j, c)
      d += result[1]
      n += result[0]
    })

    ranks.push(n/d)
  })

  return ranks
}

let data = `@metadados
numAspectos 4
niveisPorAspecto 2 3 4 2
meritos False True True True

@candidatoDesejado
nivel Sabe Intermediario Intermediario Sabe

@candidatos
1) nivel Sabe Intermediario Avancado Sabe
2) nivel Sabe Basico Avancado Sabe
3) nivel Sabe Intermediario Avancado NaoSabe
4) nivel Sabe Intermediario Intermediario Sabe
5) nivel Sabe Basico Avancado NaoSabe
`

function removeEmpt (arr) { return arr.filter(element => {
  return element !== '';
})};


function getMetadata(meta) {
    let hash = {}
    let numAttr = parseInt(meta[0].replace('numAspectos ',''));
    let levelsAttr = meta[1].replace('niveisPorAspecto ', '').split(' ')
    let merits = meta[2].replace('meritos ', '').split(' ')

    for (let i = 0; i < parseInt(numAttr); i++) {
        hash[i+1] = { n: parseInt(levelsAttr[i]), merit: (merits[i] === 'True' || merits[i] === 'true') }
    }
    return [hash, numAttr]
}

function getIdealCandidate(ideal, hash, n) {
    let values = ideal[0].replace('nivel ', '').split(' ');
    for (let i = 0; i < n; i++) {
        let scaleKey = hash[''+(i + 1)].n
        hash[i+1].value = scaleMapping[scaleKey][values[i]]
    }

    return hash
}

function getCandidates(candidates, metadata, n) {
    let cands = []
    let hash
    candidates.forEach(candidate => {
      let values = candidate.replace(/.*nivel /, '').split(' ')
      let hash = {}
      for (let i = 0; i < n; i++) {
        let scaleKey = metadata[''+(i + 1)].n
        hash[i+1] = scaleMapping[scaleKey][values[i]]
      }
      cands.push(hash)
    })

    return cands
}

exports.handler = async event => {
    const body = Buffer.from(event["content"].toString(), "base64")
    const headers = event["headers"]["content-type"]
    const boundary = multipart.getBoundary(headers)
    const buff = multipart.Parse(body, boundary)
    const csvDataString = buff[0].data.toString("utf8")

    const splited = csvDataString.split('@')
    let metadata = removeEmpt(splited[1].split('\n').slice(1))
    let idealCandidate = removeEmpt(splited[2].split('\n').slice(1))
    let candidates = removeEmpt(splited[3].split('\n').slice(1))

    const info = getMetadata(metadata)
    const infoMetaIdeal = getIdealCandidate(idealCandidate, info[0], info[1])
    const infoCandidates = getCandidates(candidates, info[0], info[1])

    const ranks = rankData(infoMetaIdeal, infoCandidates)

    metadata.splice(0, 0, '@metadados')
    metadata = metadata.join('\n')

    idealCandidate.splice(0, 0, '@candidatoDesejado')
    idealCandidate = idealCandidate.join('\n')

    candidates = ranks.map((rank, idx) => [rank, candidates[idx]])
    candidates.sort((a, b) => b[0] - a[0])
    candidates = candidates.map((c) => c[1] + " ==> " + c[0])
    candidates.splice(0, 0, '@candidates')
    candidates = candidates.join('\n')

    return {
        'statusCode': 200,
        'body': { data: metadata + '\n\n' + idealCandidate + '\n\n' + candidates }
    }
}
