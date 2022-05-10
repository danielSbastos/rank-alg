import React from 'react';
import Papa from 'papaparse';

import { Button } from 'antd';

class FileReader extends React.Component {
  constructor() {
    super();
    this.state = {
      csvfile: undefined
    };
  }

  render() {
    console.log(this.state.csvfile);
    return (
      <>
        <Button className="next-button manual-button" onClick={() => document.getElementById('file').click()}>
          Inserir Arquivo
        </Button>
        <input
          id="file"
          style={{ visibility:"hidden"}}
          className="csv-input"
          type="file"
          ref={input => {
            this.filesInput = input;
          }}
          name="file"
          placeholder={null}
          onChange={this.props.handleChange}
        />
      </>
    );
  }
}

export default FileReader;
