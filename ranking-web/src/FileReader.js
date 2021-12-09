import React from 'react';
import Papa from 'papaparse';

import { Button } from 'antd';

class FileReader extends React.Component {
  constructor() {
    super();
    this.state = {
      csvfile: undefined
    };
    this.updateData = this.updateData.bind(this);
  }

  handleChange = event => {
    this.setState({
      csvfile: event.target.files[0]
    });
    this.importCSV(event.target.files[0]);
  };

  importCSV = (csvfile) => {
    Papa.parse(csvfile, {
      complete: this.updateData,
      header: true
    });
  };

  updateData(result) {
    var data = result.data;
    this.props.setData(data);
  }

  render() {
    console.log(this.state.csvfile);
    return (
      <>
        <Button className="next-button manual-button" onClick={() => document.getElementById('files').click()}>Upload de CSV</Button>
        <input
          id="files"
          style={{ visibility:"hidden"}}
          className="csv-input"
          type="file"
          ref={input => {
            this.filesInput = input;
          }}
          name="file"
          placeholder={null}
          onChange={this.handleChange}
        />
      </>
    );
  }
}

export default FileReader;
