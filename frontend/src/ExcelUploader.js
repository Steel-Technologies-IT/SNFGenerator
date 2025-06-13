import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function ExcelUploader() {
  const [layoutFile, setLayoutFile] = useState(null);
  const [flatFile, setFlatFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [layout, setLayout] = useState([]);

  const handleLayoutChange = (e) => setLayoutFile(e.target.files[0]);
  const handleFlatFileChange = (e) => setFlatFile(e.target.files[0]);


  const [file, setFile] = useState(null);

  const handleChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('excel', file);

    const res = await fetch('http://localhost:5000/upload-excel', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    alert(data.message || 'Upload complete');
  };




  const handleUpload = async () => {
    if (!flatFile) {
      alert('Please upload both layout and flat files.');
      return;
    }

    const formData = new FormData();
    formData.append('flatfile', flatFile);

    try {
      // Tell axios to expect a blob!
      const res = await axios.post('http://localhost:5000/upload', formData, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', flatFile.name.replace(/\.[^/.]+$/, ".json")); // Use flat file name with .json extension
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed. Check console for details.');
    }
  };

  const downloadFile = (data, type) => {
    let fileContent, mimeType, fileExtension;

    if (type === 'json') {
      fileContent = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      fileExtension = 'json';
    } else if (type === 'csv') {
      const keys = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));
      const csvRows = [
        keys.join(','),
        ...data.map(row => keys.map(k => JSON.stringify(row[k] || '')).join(','))
      ];
      fileContent = csvRows.join('\n');
      mimeType = 'text/csv';
      fileExtension = 'csv';
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parsed_data.${fileExtension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadStructuredJSON = async () => {
    try {
      const res = await axios.post('http://localhost:5000/generate-json', {
        layout,
        records: parsedData
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'I856_SteelDynColombus_000004249_4259.txt');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to generate structured JSON', err);
      alert('Failed to generate structured JSON.');
    }
  };

  const downloadTrafficCopExcel = async () => {
    try {
      const res = await axios.get('http://localhost:5000/traffic_cop');
      const data = res.data;
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "TrafficCop");
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([wbout], { type: "application/octet-stream" }), 'traffic_cop.xlsx');
    } catch (err) {
      console.error('Failed to download Traffic Cop Excel', err);
      alert('Failed to download Traffic Cop Excel.');
    }
  };

  return (
    <div>
      <h2>Upload Layout and Flat File</h2>
      <div>
        <label>Layout File (.xlsx or .csv): </label>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleLayoutChange} />
      </div>
      <div>
        <label>Flat File (.txt): </label>
        <input type="file" accept=".txt" onChange={handleFlatFileChange} />
      </div>
      <button onClick={handleUpload}>Upload & Parse</button>
      <button onClick={() => downloadFile(parsedData, 'json')}>Download JSON</button>
      <button onClick={() => downloadFile(parsedData, 'csv')}>Download CSV</button>
      <button onClick={downloadStructuredJSON}>Download Structured JSON</button>
      <button onClick={downloadTrafficCopExcel}>Download Traffic Cop Excel</button>
      <form onSubmit={handleSubmit}>
      <input type="file" accept=".xlsx,.xls" onChange={handleChange} />
      <button type="submit">Upload Excel</button>
      </form>

      {parsedData.length > 0 && (() => {
        const allKeys = Array.from(new Set(parsedData.flatMap(row => Object.keys(row))));
        return (
          <table border="1" style={{ marginTop: '20px' }}>
            <thead>
              <tr>{allKeys.map((key) => <th key={key}>{key}</th>)}</tr>
            </thead>
            <tbody>
              {parsedData.map((row, idx) => (
                <tr key={idx}>
                  {allKeys.map((key) => <td key={key}>{row[key] || ''}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        );
      })()}
    </div>
  );
}

export default ExcelUploader;
