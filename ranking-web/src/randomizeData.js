const escalas = [
  {
    id: 2,
    n: 2,
    data: ['Não Sabe', 'Sabe']
  },
  {
    id: 3,
    n: 3,
    data: ['Nada', 'Básico', 'Médio']
  },
  {
    id: 4,
    n: 4,
    data: ['Nada', 'Básico', 'Médio', 'Avançado']
  },
  {
    id: 5,
    n: 5,
    data: ['Nada', 'Básico', 'Médio', 'Avançado', 'Expert']
  }
]

const merits = [true, false];

const maxAttributes = 5;
const maxCandidates = 10;

const randomize = (numAttributes, numCandidates) => {
  let objects = {};
  let scales = {};
  let _merits = {};

  let _object = {};
  let _scale;
  let _numAttributes = numAttributes || Math.floor(Math.random() * (maxAttributes -2 + 1) + 2);
  let _numCandidates = numCandidates || Math.floor(Math.random() * (maxCandidates - 1 + 1) + 1);

  for (let i = 1; i <= _numAttributes; i++) {
    scales[`Aspecto ${i}`] = escalas[escalas.length * Math.random() | 0];
    _merits[`Aspecto ${i}`] = merits[merits.length * Math.random() | 0];;

    _scale = scales[`Aspecto ${i}`];
    _object[`Aspecto ${i}`] = _scale.data[_scale.data.length * Math.random() | 0];
  }
  objects['ideal-candidate'] = _object;

  for (let i = 1; i <= _numCandidates; i++) {
    _object = {};
    for (let i = 1; i <= _numAttributes; i++) {
      _scale = scales[`Aspecto ${i}`];
      _object[`Aspecto ${i}`] = _scale.data[_scale.data.length * Math.random() | 0];
    }

    objects[i] = _object;
  };

  return {
    escalas: scales,
    merits: _merits,
    objects,
  };
};

export default randomize;
