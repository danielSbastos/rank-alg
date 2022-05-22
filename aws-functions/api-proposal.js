const percentage = (i, j, delta) => {
  let perc = 0

  if (i < j) {
    perc = (i - j) / j
  } else {
    if ((delta - j) > 0) {
      perc = (i - j) / (delta - j);
    } 
  }
  return `${(Math.round(perc * 100) * 100) / 100}% `
}

const rank = (i, j, c) => {
  let n, d = 0;

  if (i < j) {
    n = (i - j)*(j + 1);
  } else {
    n = (i - j)*(j + 1)*c;
  }

  d = (j + 1);

  return [n, d]
}

const rankIndividual = (idealCandidate, candidate, scales) => {
  let n, d, _n, _d, merit, percs;
  percs = '';
  d = n = delta = 0;

  candidate.data.forEach((data, idx) => {
    delta = scales[candidate.scales[idx]].max - scales[candidate.scales[idx]].min
    percs += percentage(data, idealCandidate.data[idx], delta)

    merit = candidate.merits[idx] ? 1 : 0;
    [_n, _d] = rank(data / delta, idealCandidate.data[idx] / delta, merit)
    n += _n
    d += _d
  })

  return { rank: n/d, perc: percs };
}

const rankData = (objects, scales) => {
  const ranks = {}
  const idealCandidate = objects[0]

  objects.slice(1, objects.length).forEach((object, idx) => {
    const { rank, perc } = rankIndividual(idealCandidate, object, scales);

    if (!isNaN(rank)) {
      ranks[idx + 1] = {
        rank: Math.round(rank * 10000)/10000,
        percentage: perc.trim()
      }
    }
  })

  return ranks;
};

const data = {
    scales: {
        2: { min: 0, max: 1 },
        3: { min: 0, max: 2 },
        4: { min: 0, max: 3 },
    },
    candidates: [{ 
        data: [1, 2, 3],
        scales: [2, 3, 4],
        merits: [true, true, true]
    }, {
        data: [0, 1, 2],
        scales: [2, 3, 4],
        merits: [true, true, true]
    }]
}

console.log(rankData(data.candidates, data.scales))
