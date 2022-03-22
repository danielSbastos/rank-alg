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

const rankData = (data) => {
    let idealCandidate = data[0]
    let candidates = {}
    data.slice(1, data.length).forEach((candidate, index) => {
        let n, d, result;
        n = d = result = 0;

        for (let attr = 1; attr <= Number.parseInt(candidate['n']); attr++) {
           let i = Number.parseInt(candidate['value'+attr]) / (Number.parseInt(candidate['max'+attr]) - Number.parseInt(candidate['min'+attr]));
           let j = Number.parseInt(idealCandidate['value'+attr]) / (Number.parseInt(idealCandidate['max'+attr]) - Number.parseInt(idealCandidate['min'+attr]));
           let merit = candidate['merit'+attr] === 'True' ? 1 : 0
           result = rank(i, j, merit)

           n += result[0]
           d += result[1]

           console.log(n, d)
        }
        candidates[index+1] = n/d
    })

    return candidates
}


const multipart = require("parse-multipart");
const csv = require("csvtojson");

exports.handler = async event => {
    const body = Buffer.from(event["content"].toString(), "base64");
    const headers = event["headers"]["content-type"];
    const boundary = multipart.getBoundary(headers);
    const buff = multipart.Parse(body, boundary);

    const csvDataString = buff[0].data.toString("utf8");
    const csvData = await csv().fromString(csvDataString);

    const ranks = rankData(csvData)

    console.log(ranks)

    return {
        'statusCode': 200,
        'body': ranks
    }
}

