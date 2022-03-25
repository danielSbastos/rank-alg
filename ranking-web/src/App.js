import './App.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

import axios from 'axios';
import { useEffect, useState } from 'react';
import { Collapse, Modal, InputNumber, Typography, Layout, Divider, Row, Col, Menu, Checkbox, Table, Button } from 'antd';
import { Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { CaretRightOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const escalas = [
  {
    id: 2,
    n: 2,
    data: ['1', '2']
  },
  {
    id: 3,
    n: 3,
    data: ['1', '2', '3']
  },
  {
    id: 4,
    n: 4,
    data: ['1', '2', '3', '4']
  },
  {
    id: 5,
    n: 5,
    data: ['1', '2', '3', '4', '5']
  }
];

const configData = [
  {
    key: 'weight',
    '-': 'Peso',
  },
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

const keyNameData = i => `Candidato ${i}`;

const escalasMenu = (column, data, setData) => (
  <Menu
    onClick={(e) => {
      setData({
        ...data,
        escalas: {
          ...data.escalas,
          [column]: { 
            weight: data.escalas[column]?.weight,
            ...escalas.find(escala => escala.id.toString() === e.key)
          }
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

const handleOnChangeWeight = (value, data, column, setData) => {
  const escalas = Object.assign({}, data.escalas);
  delete escalas[column];

  let totalWeight = Object.values(escalas).reduce((acc, cur) => acc + cur.weight, 0)
  if (totalWeight + value > 1) {
    alert('A soma dos pesos não pode ultrapassar 1')
  } else {
    setData({
      ...data,
      escalas: {
        ...data.escalas,
        [column]: {
          ...data.escalas[column],
          weight: value,
        }
      }
    })
  }
}


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
        checked={get(['merits', column], data)}
        onChange={(e) => setData({
          ...data,
          merits: {
            ...data.merits,
            [column]: !data.merits[column]
          }})}
      />
    );
  } else if (record.key === 'weight') {
    return (
      <InputNumber
        step={0.1}
        min={0}
        max={1}
        defaultValue={0}
        value={data.escalas[column]?.weight || 0}
        onChange={(value) => handleOnChangeWeight(value, data, column, setData)}
      />
    )
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

const rankData = async ({ objects, merits, escalas }, setRanks) => {
  const objs = Object.assign({}, objects);

  axios.post(`https://6bbt8vjusc.execute-api.us-east-2.amazonaws.com/prod`, {
    merits,
    objects: objs,
    scales: escalas
  }).then(res => {
    setRanks(res.data.body);
  });
};

const candidateCell = ({ name, perc }) => {
  return (
    <>
      <p style={{ margin: 0 }}>{name}</p>
      <label style={{ color: 'gray', fontSize: '14px' }}>{perc}</label>
    </>
  );
}; 

const resultColums = [
  { title: 'Candidato', dataIndex: 'object', key: 'object', render: (text, row, index) => candidateCell(text) },
  { title: 'Ordem', dataIndex: 'order', key: 'order' },
  { title: 'Valor', dataIndex: 'rankValue', key: 'rankValue' },
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
    .map(rank => ({ key: rank[0], object: { name: keyNameData(rank[0]), perc: rank[1].percentage }, rankValue: rank[1].rank } ))
    .sort((a, b) => a.rankValue > b.rankValue ? -1 : 1)
    .map((rank, idxRank) => ({ ...rank, order: idxRank + 1 }));
};

function App() {
  const [tableData, setTableData] = useState({ escalas: {}, objects: {} });
  const [ranks, setRanks] = useState({});
  const [numAttributes, setNumAttributes] = useState(0);
  const [numCandidates, setNumCandidates] = useState(0);
  const [showInfoCheckbox, setShowInfoCheckbox] = useState(true);
  const [activeKeys, setActiveKeys] = useState(['1']);

  const showIntro = localStorage.getItem("showIntro");
  const [modalVisible, setModalVisible] = useState(showIntro === 'true' || showIntro === null);

  useEffect(() => {
    const updateObjects = (objs, numAttributes) => {
      let r = {};

      Object.entries(objs).forEach(entry => {
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
        'ideal-candidate': tableData.objects['ideal-candidate']
      }
    });

  }, [numCandidates]);

  const modalFooter = [
    <Button key="ok" type="primary" onClick={() => setModalVisible(false)}>
      Ok
    </Button>
  ];

  if (showInfoCheckbox) {
    modalFooter.unshift(
      <Checkbox onChange={(e) => localStorage.setItem("showIntro", !e.target.checked)}>
        Não mostrar mais essa mensagem
      </Checkbox>
    )
  }

  const handleNextMetadata = () => {
    setActiveKeys(['2']);
  }

  const handleNextExpected = () => {
    setActiveKeys(['3']);
  }

  return (
		<Layout style={{height: '180vh' }}>
      <Header style={{ paddingLeft: '15%', paddingTop: '20px' }}>
        <Title level={2} style={{ color: 'white' }}>Ranqueamento de Candidatos</Title>
      </Header>
      <Layout>
        <Sider width={'15%'}>
          <div style={{ padding: '10%'}}>
            <Title level={4} style={{ color: 'white' }}>Definições</Title>

            <Title level={5} style={{ color: 'white' }}>Aspecto</Title>
            <Text style={{ color: 'white' }}>Característica a ser avaliada.</Text>

            <Title level={5} style={{ color: 'white' }}>Escala</Title>
            <Text style={{ color: 'white' }}>Conjuntos de possíveis valores de proficiência de um aspecto.</Text>

            <Title level={5} style={{ color: 'white' }}>Mérito</Title>
            <Text style={{ color: 'white' }}>Valorização das proficiências dos candidatos que são acima do que é desejado naquele aspecto.</Text>

            <Divider />

            <Button type="primary" onClick={() => { setModalVisible(true); setShowInfoCheckbox(false) }}>Exibir funcionamento</Button>
          </div>
        </Sider>

        <Content>
         <div className="App">
           <Title level={3}>Ambiente de Configuração</Title>
           <Collapse
              defaultActiveKey={['1']}
              bordered={false} 
              activeKey={activeKeys} 
              onChange={(keys) => setActiveKeys(keys)}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              className="site-collapse-custom-collapse"
            >
              <Panel header="Metadados" key="1" >
                <div className="manage">
                  <Row className="step-0" gutter={8}>
                    <Col className="gutter-row">
                      <label>Quantidade de aspectos:
                        <InputNumber
                          style={{ marginLeft: '5px', width: '60px' }}
                          min={0}
                          max={3}
                          defaultValue={0}
                          onChange={(value) => setNumAttributes(value)}
                        />
                      </label>
                    </Col>
                    <Col>
                     <Button className="next-button" onClick={handleNextMetadata}>Próximo</Button>
                    </Col>
                  </Row>
                </div>
              </Panel>

                <Panel header="Escalas, méritos e candidato desejado" key="2">
                <Row className="step-1">
                  <Col span={24}>
                    <Table
                      pagination={false}
                      className="table-striped-rows"
                      columns={buildColumns(genAttributes(numAttributes), tableData, setTableData)}
                      dataSource={configData}
                    />
                  </Col>

                  <Button className="next-button manual-button" onClick={handleNextExpected}>Próximo</Button>
                </Row>
              </Panel>
              <Panel header="Candidatos" key="3">
                  <Row className="step-1" gutter={24}>
                    <Col className="gutter-row">
                      <label>Quantidade de candidatos:
                        <InputNumber
                          style={{ marginLeft: '5px', width: '60px' }}
                          min={0}
                          max={10}
                          value={numCandidates}
                          defaultValue={0}
                          onChange={(value) => setNumCandidates(value)}
                        />
                      </label>
                    </Col>
                    <Col>
                      {numCandidates > 0 &&
                        <Button type="primary" style={{ backgroundColor: '#11ab11', borderColor: '#11ab11' }} onClick={() => rankData(tableData, setRanks)}>Ranquear candidados</Button>
                      }
                    </Col>
                  </Row>
                  <Table
                    scroll={{ y: 'calc(100vh - 10em)' }}
                    pagination={false}
                    className="table-striped-rows"
                    columns={buildColumns(genAttributes(numAttributes), tableData, setTableData)}
                    dataSource={genData(numCandidates)}
                  />
                </Panel>
            </Collapse>
          </div>
        </Content>


        <Sider width={'25%'}>
          <div style={{ padding: '6% 8%'}}>
            <Title level={3} style={{ color: 'white' }}>Resultados</Title>
            <Text style={{ color: 'white' }}>Interpretando o "Valor":</Text>
            <ul style={{ color: 'white' }}>
              <li><b>Entre -1 e 0:</b> proficiências dos aspectos do candidato estão abaixas das desejadas;</li>
              <li><b>Igual à 0:</b> proficiências estão iguais às desejadas;</li>
              <li><b>Entre 0 e 1:</b> proficiências estão acima das desejadas.</li>
            </ul>

            {Object.keys(ranks).length > 0 ?
              <Table
                className='results'
                pagination={false}
                columns={resultColums}
                dataSource={sortRanks(ranks)}
              />
             : <Text italic style={{ color: 'gray' }}>Ranqueie algum candidato primeiro para visualizar os resultados.</Text>
            }
          </div>
        </Sider>
      </Layout>

      <Modal
        title="Funcionamento"
        centered
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={modalFooter}
      >
        <p>
          Essa ferramenta permite que candidatos sejam ranqueados com base num candidato ideal. Este contém os níveis de proficiência desejados em cada aspecto, e os outros candidatos contêm os seus respectivos niveis de proficiência. Quanto maior o nivel de proficiência de um candidato, maior o seu valor de rank final.
        </p>

        <p>
          Cada aspecto pode ter diferentes conjuntos de níveis de proficiências, desde o mais genérico, e.g. Não Sabe e Sabe, até o mais granular, e.g. Nada, Básico, Médio, Avançado, Expert.
        </p>
        <p>
          Para cada aspecto, as proficiências dos candidatos que são acima do desejado pelo candidato ideal podem ou não ser valorizadas. A valorização é dada pela presença do mérito. Na prática, significa que caso haja mérito em um requisito, as proficiências dos candidatos que são acima do desejado serão valorizadas baseadas no seu nivel (o maior, melhor), caso contrário, não serão valorizadas, ou seja, serão consideradas fossem iguais no valor de rank final.
        </p>
        <p>
          O valor final de rank de cada candidato será um agrupamento das comparações de suas proficiências com o que é desejado e o mérito.
        </p>
      </Modal>
    </Layout>
  );
}

export default App;
