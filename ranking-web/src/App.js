import './App.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

import { useEffect, useState } from 'react';
import { Menu, Checkbox, Table, Button } from 'antd';
import { Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const attributes = ['Name', 'PPT', 'Excel', 'Word'];
const escalas = [
  {
    id: 2,
    n: 2,
    data: ['Sabe', 'Não Sabe']
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
    Name: 'Escala',
    PPT: null,
    Excel: null,
    Word: null,
  },
  {
    key: 'merit',
    Name: 'Mérito',
    PPT: null,
    Excel: null,
    Word: null,
  },
  {
    key: 'base',
    Name: 'Base',
    PPT: null,
    Excel: null,
    Word: null,
  },
  {
    key: 1,
    Name: 'Dado 1',
    PPT: null,
    Excel: null,
    Word: null,
  },
  {
    key: 2,
    Name: 'Dado 2',
    PPT: null,
    Excel: null,
    Word: null,
  }
];

const escalasMenu = (column, data, setData) => (
  <Menu
    onClick={(e) => setData({
      ...data,
      escalas: {
        ...data.escalas,
        [column]: escalas.find(escala => escala.id.toString() === e.key)
      }
    })}>
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
  } 
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

const buildColumns = (attributes, tableData, setTableData) => {
  let column = null;
  let columns = [];

  const renderCol = (attr, text, record) => {
    if (attr === 'Name') {
      return <b>{text}</b>;
    }

    return renderItem(text, record, attr, tableData, setTableData);
  };

  attributes.forEach(attr => {
    column = { title: attr, dataIndex: attr, key: attr };
    column['render'] = (text, record) => renderCol(attr, text, record);
    columns.push(column);
  });

  return columns;
};

const rankObj = (object, base, merits, escalas) => {
  let n, d, i, j, c;
  let ranks = [];

  d = n = 0;

  for (const [attr, attrValue] of Object.entries(object)) {
    if (escalas[attr]) {
      i = escalas[attr].data.indexOf(attrValue) / (escalas[attr].n - 1);
      j = escalas[attr].data.indexOf(base[attr]) / (escalas[attr].n - 1);
      c = merits[attr] ? 1 : 0;

      if (i < j) {
        n += (i**2 - j**2)*(j + 1);
      } else {
        n += (i - j)*(j + 1)*c;
      }

      d += (j + 1);
    }
  }

  return n/d;
};


// const rank = ({ objects, merits, escalas }) => {
//   const base = objects['base'];
//   delete objects['base'];

//   let n, d, i, j, c;
//   let ranks = [];

//   for (const [key, value] of Object.entries(objects)) {
//     d = n = 0;

//     for (const [attr, attrValue] of Object.entries(value)) {
//       if (escalas[attr]) {
//         i = escalas[attr].data.indexOf(attrValue) / (escalas[attr].n - 1);
//         j = escalas[attr].data.indexOf(base[attr]) / (escalas[attr].n - 1);
//         c = merits[attr] ? 1 : 0;

//         if (i < j) {
//           n += (i**2 - j**2)*(j + 1);
//         } else {
//           n += (i - j)*(j + 1)*c;
//         }

//         d += (j + 1);
//       }
//     }

//     ranks.push({ [key]: n/d });
//   }

//   return ranks;
// };

const allSelected = (obj) => Object.values(obj).filter(v => v == null).length === 0;

function App() {
  const [tableData, setTableData] = useState({
    escalas: {},
    merits: attributes
      .slice(1, attributes.length)
      .reduce((prev, cur) => ({ ...prev, [cur]: false }), {}),
    objects: data
      .slice(2, data.length)
      .reduce((prev, cur) => ({ ...prev, [cur.key]: { Word: null, PPT: null, Excel: null} }), {})
  });

  const [ranks, setRanks] = useState({});

  useEffect(() => {
    for (const [attr, attrValue] of Object.entries(tableData.objects)) {
      if (attr !== 'base' && allSelected(attrValue)) {
        const r = rankObj(attrValue, tableData.objects.base, tableData.merits, tableData.escalas);
        console.log(r);
        // TODO: Infinite render
        setRanks({ ...ranks, [attr]: r });
      }
    }
  }, [tableData, ranks]);

  return (
    <div className="App">
      <header className="App-header">
        <Table
          className="table-striped-rows"
          columns={buildColumns(attributes, tableData, setTableData)}
          dataSource={data}
        />
      </header>
    </div>
  );
}

export default App;

// TODO: Reset valores quando escala muda
