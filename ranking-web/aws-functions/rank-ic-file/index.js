// const percentage = (i, j, delta) => {
//   let perc = 0

//   if (i < j) {
//     perc = (i - j) / j
//   } else {
//     if ((delta - j) > 0) {
//       perc = (i - j) / (delta - j);
//     } 
//   }
//   return `${(Math.round(perc * 100) * 100) / 100}% `
// }

// const rank = (i, j, c) => {
//   let n, d = 0;

//   if (i < j) {
//     n = (i - j)*(j + 1);
//   } else {
//     n = (i - j)*(j + 1)*c;
//   }

//   d = (j + 1);

//   return [n, d]
// }

// const rankIndividual = (idealCandidate, candidate, scales) => {
//   let n, d, _n, _d, delta, merit, percs;
//   percs = '';
//   d = n = delta = 0;

//   candidate.data.forEach((data, idx) => {
//     delta = scales[candidate.scales[idx]].max - scales[candidate.scales[idx]].min
//     percs += percentage(data, idealCandidate.data[idx], delta)

//     merit = candidate.merits[idx] ? 1 : 0;
//     [_n, _d] = rank(data / delta, idealCandidate.data[idx] / delta, merit)
//     n += _n
//     d += _d
//   })

//   return { rank: n/d, perc: percs };
// }

// const rankData = (objects, scales) => {
//   const ranks = []
//   const idealCandidate = objects[0]

//   objects.slice(1, objects.length).forEach((object, idx) => {
//     const { rank, perc } = rankIndividual(idealCandidate, object, scales);

//     if (!isNaN(rank)) {
//       ranks.push({
//         rank: Math.round(rank * 10000)/10000,
//         percentage: perc.trim()
//       })
//     }
//   })

//   return ranks;
// };

// const multipart = require("parse-multipart");
// const csv = require("csvtojson");

exports.handler = async event => {   
    console.log(`Event: ${JSON.stringify(event)}`); 
    const body = Buffer.from(event["content"].toString(), "base64").toString('ascii'); // AWS case    

    // const boundary = multipart.getBoundary(event.headers["Content-Type"]);
    // const buff = multipart.Parse(body, boundary);
    // const csvDataString = buff[0].data.toString("utf8");
    // const csvData = await csv().fromString(csvDataString);
    console.log(body);
    
    return {
        'statusCode': 200,
        'body': 'hello' //JSON.stringify(csvData)
    }
}

// exports.handler = async (event) => {
//   console.log(event);
  
//   const { objects, scales } = event;
//   const r = rankData(objects, scales)
   
//     // TODO implement
//   const response = {
//     headers: {
//       "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
//       "Access-Control-Allow-Methods" : "OPTIONS,POST",
//       "Access-Control-Allow-Credentials" : true,
//       "Access-Control-Allow-Origin" : "*",
//       "X-Requested-With" : "*"
//     },
//     statusCode: 200,
//     body: r
//   };
//   return response;
// };
