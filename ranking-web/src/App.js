import './App.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

import axios from 'axios';
import { useEffect, useState } from 'react';
import { InputNumber, Typography, Layout, Divider, Row, Col, Menu, Checkbox, Table, Button } from 'antd';
import { Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

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

const configData = [
  {
    key: 'scale',
    '-': 'Escala',
  },
  {
    key: 'merit',
    '-': 'Mérito',
  },
  {
    key: 'ideal-candidate',
    '-': 'Candidato desejado',
  }
];

const keyNameData = {
  '1': 'Candidato 1',
  '2': 'Candidato 2',
  '3': 'Candidato 3',
  '4': 'Candidato 4',
  '5': 'Candidato 5',
  '6': 'Candidato 6',
  '7': 'Candidato 7',
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
        checked={data.merits[column]}
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

const initialObject = (attributes) => {
  return attributes.reduce((acc, cur) => ({ ...acc, [cur]: null }), {});
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

const rank = async ({ objects, merits, escalas }, setRanks) => {
  const objs = Object.assign({}, objects);

  axios.post(`https:6bbt8vjusc.execute-api.us-east-2.amazonaws.com/prod`, {
    merits,
    objects: objs,
    scales: escalas
  }).then(res => {
    setRanks(res.data.body);
  });
};

const resultColums = [
  { title: 'Candidato', dataIndex: 'object', key: 'object' },
  { title: 'Ordem', dataIndex: 'order', key: 'order' },
  { title: 'Valor', dataIndex: 'rankValue', key: 'rankValue' }
];

const genAttributes = (n, ignoreFirst) => {
  let c = n;
  let attributes;

  if (ignoreFirst) {
    attributes = [];
  } else {
    attributes = ['-'];
  }

  while (c > 0) {
    attributes.push(`Aspecto ${n - c + 1}`);
    c--;
  }

  return attributes;
};

const genData = n => {
  let c = n;
  const data = [];

  while (c > 0) {
    data.push({ key: n - c + 1, '-': `Candidato ${n - c + 1}`});
    c--;
  }

  return data;
};

const merge = (obj1, obj2) => {
  if (obj1 === undefined) return obj2;

  let r = obj2;
  Object.entries(obj2).forEach(_obj2 => {
    if (obj1[_obj2[0]] != null) {
      r[_obj2[0]] = obj1[_obj2[0]];
    }
  });

  return r;
};

const sortRanks = ranks => {
  return Object
    .entries(ranks)
    .map(rank => ({ key: rank[0], object: keyNameData[rank[0]], rankValue: rank[1]} ))
    .sort((a, b) => a.rankValue > b.rankValue ? -1 : 1)
    .map((rank, idxRank) => ({ ...rank, order: idxRank + 1 }));
};

function App() {
  const [tableData, setTableData] = useState({ escalas: {}, objects: {} });
  const [ranks, setRanks] = useState({});
  const [step, setStep] = useState(0);
  const [numAttributes, setNumAttributes] = useState(0);
  const [numCandidates, setNumCandidates] = useState(0);

  useEffect(() => {
    const updateObjects = (objs, numAttributes) => {
      let r = {};

      Object.entries(objs).map(entry => {
        const newObj = genAttributes(numAttributes, true);
        r[entry[0]] = merge(entry[1], initialObject(newObj));
      });

      return r;
    };

    const updateMerits = (numAttributes) => {
      const newObj = genAttributes(numAttributes, true);
      return newObj.reduce((prev, cur) => ({ ...prev, [cur]: true }), {});
    };

    setTableData({
      ...tableData,
      merits: updateMerits(numAttributes),
      objects: updateObjects(tableData.objects, numAttributes)
    });

  }, [numAttributes]);

  useEffect(() => {
    const data = genData(numCandidates);
    const objs = data.reduce((prev, cur) => ({
      ...prev,
      [cur.key]: merge(
        tableData.objects[cur.key],
        initialObject(genAttributes(numAttributes, true)))
    }), {});

    setTableData({
      ...tableData,
      objects: {
        ...objs,
        ['ideal-candidate']: tableData.objects['ideal-candidate']
      }
    });

  }, [numCandidates]);

  return (
    <Layout>
      <Header style={{ height: '90px', paddingLeft: '230px', paddingTop: '20px' }}>
        <Title level={2} style={{ color: 'white' }}>Ranqueamento de Candidatos</Title>
      </Header>
      <Layout>
        <Sider width={230}>
          <div style={{ padding: '10%'}}>
            <Title level={4} style={{ color: 'white' }}>Definições</Title>

            <Title level={5} style={{ color: 'white' }}>Aspecto</Title>
            <Text style={{ color: 'white' }}>Blablabla blabla</Text>

            <Title level={5} style={{ color: 'white' }}>Escala</Title>
            <Text style={{ color: 'white' }}>Blablabla blabla</Text>

            <Title level={5} style={{ color: 'white' }}>Mérito</Title>
            <Text style={{ color: 'white' }}>Blablabla blabla</Text>

            <Title level={5} style={{ color: 'white' }}>Candidato desejado</Title>
            <Text style={{ color: 'white' }}>Blablabla blabla</Text>

            <Title level={5} style={{ color: 'white' }}>Candidatos</Title>
            <Text style={{ color: 'white' }}>Blablabla blabla</Text>
            <Divider />
          </div>
        </Sider>

        <Content>
         <div className="App">
            <Title level={3}>Ambiente de Configuração</Title>
            <Row className="step-0">
              <p>Quantidade de aspectos:
                <InputNumber
                  style={{ marginLeft: '21px' }}
                  min={1}
                  max={10}
                  defaultValue={0}
                  onChange={(value) => setNumAttributes(value)}
                />
              </p>
            </Row>
            <Row className="step-0">
              <label>Quantidade de candidatos:
                <InputNumber
                  style={{ marginLeft: '10px' }}
                  min={1}
                  max={10}
                  defaultValue={0}
                  onChange={(value) => setNumCandidates(value)}
                />
              </label>
            </Row>
            {step === 0 && <Button className="rank" type="primary" onClick={() => setStep(1)}>Próximo</Button>}

            {step >= 1 &&
              <>
                <br />
                <Row className="step-1">
                  <Col span={24}>
                    <Table
                      pagination={false}
                      className="table-striped-rows"
                      columns={buildColumns(genAttributes(numAttributes), tableData, setTableData)}
                      dataSource={configData}
                    />
                  </Col>

                  {step === 1 && <Button className="rank" type="primary" onClick={() => setStep(2)}>Definir candidatos</Button>}
                </Row>
              </>
            }

            {step >= 2 &&
              <>
                <Divider />
                <Title level={3}>Candidatos</Title>
                <Row className="step-1">
                  <Col span={24}>
                    <Table
                      pagination={false}
                      className="table-striped-rows"
                      columns={buildColumns(genAttributes(numAttributes), tableData, setTableData)}
                      dataSource={genData(numCandidates)}
                    />
                  </Col>

                  <Button className="rank" type="primary" onClick={() => rank(tableData, setRanks)}>Ranquear candidados</Button>
                </Row>
              </>
            }
          </div>
        </Content>
        <Sider width={'25%'}>
          <div style={{ padding: '6% 8%'}}>
            {Object.keys(ranks).length > 0 &&
              <>
                <Title level={3} style={{ color: 'white' }}>Resultados</Title>
                <Table
                  className='results'
                  pagination={false}
                  columns={resultColums}
                  dataSource={sortRanks(ranks)}

                />
              </>
            }
          </div>
        </Sider>
      </Layout>
    </Layout>
  );
}

export default App;
