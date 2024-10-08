import './App.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

import sampleData from './sampleData';
import randomizeData from './randomizeData';
import FileReader from './FileReader';

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

const keyNameData = i => `Candidato ${i}`;

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
        checked={get(['merits', column], data)}
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
      <label style={{ color: 'gray', fontSize: '12px' }}>{perc}</label>
    </>
  );
}

const resultColums = [
  { title: 'Candidato', dataIndex: 'object', key: 'object', render: (text, row, index) => candidateCell(text) },
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
    .map(rank => ({ key: rank[0], object: { name: keyNameData(rank[0]), perc: rank[1].percentage }, rankValue: rank[1].rank } ))
    .sort((a, b) => a.rankValue > b.rankValue ? -1 : 1)
    .map((rank, idxRank) => ({ ...rank, order: idxRank + 1 }));
};

const attributeMapping = {
  nada: 'Nada',
  basico: 'Básico',
  medio: 'Médio',
  avancado: 'Avançado',
  expert: 'Expert',
};

function App() {
  const [tableData, setTableData] = useState({ escalas: {}, objects: {} });
  const [ranks, setRanks] = useState({});
  const [step, setStep] = useState(-1);
  const [numAttributes, setNumAttributes] = useState(0);
  const [numCandidates, setNumCandidates] = useState(0);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [sample, setSample] = useState(false);
  const [showInfoCheckbox, setShowInfoCheckbox] = useState(true);
  const [uploadData, setUploadData] = useState([]);
  const [uploadDataLoading, setUploadDataLoading] = useState(null);
  const [activeKeys, setActiveKeys] = useState([]);
  const [showCandidates, setShowCandidates] = useState(false);
  const [disabledSteps, setDisabledSteps] = useState([]);

  const showIntro = localStorage.getItem("showIntro");
  const [modalVisible, setModalVisible] = useState(showIntro === 'true' || showIntro === null);

  const handleGenRandomData = () => {
    const randomData = randomizeData();
    const newAttributesNum = Object.keys(randomData.escalas).length
    const newCandidatesNum = Object.keys(randomData.objects).length

    if (newAttributesNum !== numAttributes) setNumAttributes(newAttributesNum);
    if ((newCandidatesNum - 1) !== numCandidates) setNumCandidates(newCandidatesNum - 1);

    if (disabledSteps.length > 0) setDisabledSteps([]);
    setTableData(randomData);
    setSampleLoading(true);
    setSample(true);
    setActiveKeys(['2', '3']);
    setShowCandidates(true);
  };

  const handleGenManual = () => {
    setRanks({});
    setTableData({ escalas: {}, objects: {} });
    setSample(false);
    setStep(0);
    setActiveKeys(['1']);
    setDisabledSteps(['2', '3']);
  }

  const handleGenSampleData = (sampleData) => {
    if (disabledSteps.length > 0) setDisabledSteps([]);

    setNumAttributes(Object.keys(sampleData.escalas).length);
    setNumCandidates(Object.keys(sampleData.objects).length - 1);
    setTableData(sampleData);
    setSampleLoading(true);
    setSample(true);
    setActiveKeys(['2', '3']);
    setShowCandidates(true);
  };

  useEffect(() => {
    if (sampleLoading) {
      setStep(2);
      rankData(tableData, setRanks);
      setSampleLoading(false);
    }
  }, [sampleLoading]);

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
        'ideal-candidate': tableData.objects['ideal-candidate']
      }
    });

  }, [numCandidates]);

  useEffect(() => {
    const result = {};
    let values;

    if (uploadData.length > 0) {
      const keys = genAttributes(numAttributes, true);

      uploadData.forEach((_data, idx) => {
        result[idx + 1] = {};
        values = Object.values(_data).map(d => attributeMapping[d.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()]);

        keys.forEach((key, i) => result[idx + 1][key] = values[i]);
      });

      setTableData({
        ...tableData,
        objects: {
          ...result,
          'ideal-candidate': tableData.objects['ideal-candidate']
        }
      });

      setUploadDataLoading(false);
      setNumCandidates(Object.keys(result).length);
      setShowCandidates(true);
    }
  }, [uploadData]);

  useEffect(() => {
    if (uploadDataLoading === false) {
      setStep(2);
    }
  }, [uploadDataLoading])

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

  const handleUploadData = (data) => {
    setUploadData(data)
  }

  const handleNextMetadata = () => {
    setStep(1);
    setActiveKeys(['2']);
    setDisabledSteps(['3']);
  }

  const handleNextExpected = () => {
    setActiveKeys(['3']);
    setDisabledSteps([]);
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
            <Row style={{ marginBottom: '2%' }}>
             <Col>
               <Button className="rank" type="primary" onClick={handleGenManual}>Inserir candidatos</Button>
             </Col>

             <Col>
              <Divider type="vertical" />
              <Button className="rank" type="primary" onClick={() => handleGenSampleData(sampleData)}>Gerar exemplo</Button>
             </Col>

             <Col>
              <Divider type="vertical" />
              <Button className="rank" type="primary" onClick={handleGenRandomData}>Gerar candidatos aleatórios</Button>
             </Col>
           </Row>

            <Collapse
              defaultActiveKey={['1']}
              bordered={false}
              activeKey={activeKeys}
              onChange={(keys) => setActiveKeys(keys)}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              className="site-collapse-custom-collapse"
            >
             {(step >= 0 && !sample) &&
              <Panel header="Metadados" key="1" >
                <div className="manage">
                  <Row className="step-0" gutter={8}>
                    <Col className="gutter-row">
                      <label>Quantidade de aspectos:
                        <InputNumber
                          style={{ marginLeft: '5px', width: '60px' }}
                          min={0}
                          max={10}
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
            }

            {step >= 0 &&
                <Panel header="Escalas, méritos e candidato desejado" key="2" collapsible={disabledSteps.includes("2") ? "disabled" : ""}>
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
            }

            {step >= 0 &&
                <Panel header="Candidatos" key="3" collapsible={disabledSteps.includes("3") ? "disabled" : ""}>
                  {!sample &&
                    <Row>
                      <Col span={8}>
                        <Button className="next-button manual-button" onClick={() => setShowCandidates(true)}>Inserir manualmente</Button>
                        <label style={{ margin: '0 2%' }}>Ou</label>
                        <FileReader setData={handleUploadData} />
                      </Col>
                    </Row>
                  }

                  {showCandidates &&
                    <>
                      <Row className="step-1" gutter={24}>
                        <Col className="gutter-row">
                          <label>Quantidade de candidatos:
                            <InputNumber
                              style={{ marginLeft: '5px', width: '60px' }}
                              min={0}
                              max={10000}
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
                    </>
                  }
                </Panel>
              }
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
                size="middle"
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
