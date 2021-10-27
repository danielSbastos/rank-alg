import './App.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

import axios from 'axios';
import { useState } from 'react';
import { Row, Col, Menu, Checkbox, Table, Button } from 'antd';
import { Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const attributes = ['-', 'Atributo 1', 'Atributo 2', 'Atributo 3', 'Atributo 4', 'Atributo 5', 'Atributo 6'];
const escalas = [
  {
    id: 2,
    n: 2,
    data: ['Não Sabe', 'Sabe']
  },
  {
    id: 3,
    n: 3,
    data: ['Básico', 'Médio', 'Avançado']
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
];

const data = [
  {
    key: 'scale',
    '-': 'Escala',
  },
  {
    key: 'merit',
    '-': 'Mérito',
  },
  {
    key: 'base',
    '-': 'Base',
  },
  {
    key: 1,
    '-': 'Objeto 1',
  },
  {
    key: 2,
    '-': 'Objeto 2',
  },
  {
    key: 3,
    '-': 'Objeto 3',
  },
  {
    key: 4,
    '-': 'Objeto 4',
  },
  {
    key: 5,
    '-': 'Objeto 5',
  },
  {
    key: 6,
    '-': 'Objeto 6',
  }
];

const keyNameData = {
  '1': 'Objeto 1',
  '2': 'Objeto 2',
  '3': 'Objeto 3',
  '4': 'Objeto 4',
  '5': 'Objeto 5',
  '6': 'Objeto 6',
};

const escalasMenu = (column, data, setData) => (
  <Menu
    onClick={(e) => {
      setData({
        ...data,
        escalas: {
          ...data.escalas,
          [column]: escalas.find(escala => escala.id.toString() === e.key)
        }
      });
    }}>
    {escalas.map(escala => (
      <Menu.Item key={escala.id}>
        n: {escala.n} | {escala.data.join(', ')}
      </Menu.Item>
    ))}
  </Menu>
);

const get = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o);

const valoresEscalaMenu = (escala, column, objName, data, setData) => {
  const rankObj = (e) => {
    setData({
      ...data,
      objects: {
        ...data.objects,
        [objName]: {
          ...data.objects[objName],
          [column]: e.key
        }
      }});
  };

  return (
    <Menu
      onClick={rankObj}>
      {escala.data.map(nivel => (
        <Menu.Item key={nivel}>
          {nivel}
        </Menu.Item>
      ))}
    </Menu>
  );
};


const renderItem = (text, record, column, data, setData) => {
  if (record.key === 'scale') {
    return (
      <Dropdown overlay={escalasMenu(column, data, setData)}>
        <Button value={data.escalas[column]}>
          {data.escalas[column]?.id || 'Escolher '} <DownOutlined />
        </Button>
      </Dropdown>
    );
  } else if (record.key === 'merit') {
    return (
      <Checkbox
        onChange={(e) => setData({
          ...data,
          merits: {
            ...data.merits,
            [column]: !data.merits[column]
          }})}
      />
    );
  };

  let escala = escalas.find(escala => escala.id === data.escalas[column]?.id);
  if (escala) {
    return (
      <Dropdown
        overlay={valoresEscalaMenu(escala, column, record.key, data, setData)}
      >
        <Button>
          {get(['objects', record.key, column], data) || 'Escolher '} <DownOutlined />
        </Button>
      </Dropdown>
    );
  }

  return <i>Escolha uma escala</i>;
};

const initialObject = () => {
  return attributes.slice(1, attributes.length).reduce((acc, cur) => ({ ...acc, [cur]: null }), {});
};

const buildColumns = (attributes, tableData, setTableData) => {
  let column = null;
  let columns = [];

  const renderCol = (attr, text, record, index) => {
    if (attr === '-') {
      return <b>{text}</b>;
    }

    return renderItem(text, record, attr, tableData, setTableData);
  };

  attributes.forEach(attr => {
    column = { title: attr, dataIndex: attr, key: attr };
    column['render'] = (text, record, index) => renderCol(attr, text, record, index);
    columns.push(column);
  });

  return columns;
};

// const rank = ({ objects, merits, escalas }, setRanks, setRankingSpan) => {
//   const objs = Object.assign({}, objects);
//   delete objs.base;

//   let n, d, i, j, c;
//   let ranks = {};

//   for (const [key, value] of Object.entries(objs)) {
//     d = n = 0;

//     for (const [attr, attrValue] of Object.entries(value)) {
//       if (attrValue && objects.base[attr] && escalas[attr]) {
//         i = escalas[attr].data.indexOf(attrValue) / (escalas[attr].n - 1);
//         j = escalas[attr].data.indexOf(objects.base[attr]) / (escalas[attr].n - 1);
//         c = merits[attr] ? 1 : 0;

//         if (i < j) {
//           n += (i**2 - j**2)*(j + 1);
//         } else {
//           n += (i - j)*(j + 1)*c;
//         }

//         d += (j + 1);
//       }
//     }

//     if (!isNaN(n/d)) ranks[key] = n/d;
//   }

//   setRankingSpan(16);
//   setRanks(ranks);
// };

const rank = async ({ objects, merits, escalas }, setRanks, setRankingSpan) => {
  debugger;
  const objs = Object.assign({}, objects);
  delete objs['add'];

  axios.post(`https://6bbt8vjusc.execute-api.us-east-2.amazonaws.com/prod`, {
    merits,
    objects: objs,
    scales: escalas
  }).then(res => {
    setRanks(res.data.body);
    setRankingSpan(16);
  });
};

const resultColums = [
  { title: 'Objeto', dataIndex: 'object', key: 'object' },
  { title: 'Rank', dataIndex: 'rankValue', key: 'rankValue' }
];

function App() {
  const [tableData, setTableData] = useState({
    escalas: {},
    merits: attributes
      .slice(1, attributes.length)
      .reduce((prev, cur) => ({ ...prev, [cur]: false }), {}),
    objects: data
      .slice(2, data.length)
      .reduce((prev, cur) => ({ ...prev, [cur.key]: initialObject() }), {})
  });

  const [ranks, setRanks] = useState({});
  const [rankingSpan, setRankingSpan] = useState(24);

  return (
    <div className="App">
      <Row>
        <Col span={rankingSpan}>
          <header className="App-header">
            <h2>Ranking</h2>
            <Table
              pagination={false}
              className="table-striped-rows"
              columns={buildColumns(attributes, tableData, setTableData)}
              dataSource={data}
            />
            <Button className="rank" type="primary" onClick={() => rank(tableData, setRanks, setRankingSpan)}>Ranquear</Button>
          </header>
        </Col>
        <Col span={24 - rankingSpan}>
          <header className="App-header">
            {Object.keys(ranks).length > 0 &&
             <>
              <h3>Resultados</h3>
              <Table
                className='results'
                pagination={false}
                columns={resultColums}
                dataSource={Object.entries(ranks).map(rank => ({ key: rank[0], object: keyNameData[rank[0]], rankValue: rank[1]} ))}
              />
             </>
            }
          </header>
        </Col>
      </Row>
    </div>
  );
}

export default App;
