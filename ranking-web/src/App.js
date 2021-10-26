import logo from './logo.svg';
import './App.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

import { useState } from 'react';
import { Menu, Checkbox, Table, Tag, Space, Button, DatePicker } from 'antd';
import { Dropdown, message, Tooltip } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';

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
  }
];

const escalasMenu = (column, data, setData) => (
  <Menu
    onClick={(e) => setData({
      ...data,
      escalas: { ...data.escalas, [column]: e.key }
    })}>
    {escalas.map(escala => (
      <Menu.Item key={escala.id}>
        n: {escala.n} | {escala.data.join(', ')}
      </Menu.Item>
    ))}
  </Menu>
);

const valoresEscalaMenu = (escala, column, objName, data, setData) => (
  <Menu
    onClick={(e) => setData({
      ...data,
      objects: {
        ...data.objects,
        [objName]: {
          ...data.objects[objName],
          [column]: e.key
        }
      }}
    )}>
    {escala.data.map(nivel => (
      <Menu.Item key={nivel}>
        {nivel}
      </Menu.Item>
    ))}
  </Menu>
);

const renderItem = (text, record, column, data, setData) => {
  if (record.key === 'scale') {
    return (
      <Dropdown overlay={escalasMenu(column, data, setData)}>
        <Button value={data.escalas[column]}>
          {data.escalas[column] || 'Escolher '} <DownOutlined />
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

  let escala = escalas.find(escala => escala.id.toString() === data.escalas[column]);
  if (escala) {
    return (
      <Dropdown overlay={valoresEscalaMenu(escala, column, record.key, data, setData)}>
        <Button>
          {data.objects[record.key][column] || 'Escolher '} <DownOutlined />
        </Button>
      </Dropdown>
    );
  }

  return <i>Escolha uma escala</i>;
};

const buildColumns = (attributes, tableData, setTableData) => {
  let currentAttribute = null;
  let column = null;
  let columns = [];

  attributes.forEach(attr => {
    column = { title: attr, dataIndex: attr, key: attr };
    column['render'] = (attr === 'Name')
      ? (attr) => <b>{attr}</b>
    : (text, record) => renderItem(text, record, attr, tableData, setTableData);
    columns.push(column);
  });

  return columns;
};


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

  return (
    <div className="App">
      <header className="App-header">
        <Table
          columns={buildColumns(attributes, tableData, setTableData)}
          dataSource={data}
        />
      </header>
    </div>
  );
}

export default App;

// TODO: Reset valores quando escala muda
