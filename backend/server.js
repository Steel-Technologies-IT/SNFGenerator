// Description: This is the main server file for the backend of the SNF Decoder application.
// It sets up an Express server, handles file uploads using Multer, processes Excel and flat files,
// and provides endpoints for generating JSON and decoding SNF files.

//Import required modules
const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const app = express();
const port = 5000;
const fs = require('fs');
const path = require('path');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const multiUpload = upload.fields([
  { name: 'layout', maxCount: 1 },
  { name: 'flatfile', maxCount: 1 }
]);

// Import functions and modules
const { writeStructuredJSON } = require('./856/856i.js');
const { transformToStructuredJSON } = require('./856/856json.js');
const pool = require("./db")


// Middleware setup
app.use(cors());
app.use(express.json());


// MARK: Generate JSON
// Endpoint to generate JSON from records
app.post('/generate-json', async (req, res) => {
  try {
    const { records } = req.body;
    // Await the async transformation function
    const structured = await transformToStructuredJSON(records);
    const jsonString = JSON.stringify(structured, null, 2);
    res.setHeader('Content-Disposition', 'attachment; filename=output.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonString);
  } catch (error) {
    console.error('JSON generation error:', error);
    res.status(500).json({ error: 'Failed to generate JSON file' });
  }
});


//MARK: Decode SNF
//Decodes the SNF file and returns the structured JSON to CleoHarmony
app.post('/upload', multiUpload, async (req, res) => {
  try {
    const layoutBuffer = req.files['layout'][0].buffer;
    const flatFileObj = req.files['flatfile'][0];
    const flatText = flatFileObj.buffer.toString('utf-8');

    // Read layout Excel
    const workbook = xlsx.read(layoutBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Read from row 4 (0-indexed = 3)
    const rawRows = xlsx.utils.sheet_to_json(sheet, { range: 3, defval: '', header: 1 });

    
    // Manually define headers from row 3
    const headers = [
      'code', 'description', 'position', 'length', 'type', 'id', 'elem_id', 'value',
      'tad_item', 'codes_comments'
    ];

    // Convert to objects
    const rows = rawRows.slice(1).map(row => {
      const obj = {};
      headers.forEach((key, i) => {
        obj[key] = row[i];
      });
      return obj;
    });

    // Filter and map layout
    const layout = rows
      .filter(row => row.code && !isNaN(row.position) && !isNaN(row.length))
      .map(row => ({
        record_code: row.code.toString().trim(),
        field_description: row.description,
        field_position: parseInt(row.position),
        field_length: parseInt(row.length)
      }));

    // Parse flat file
    const lines = flatText.split(/\r?\n/).filter(Boolean);
    const parsed = [];
    for (const line of lines) {
      const recordCode = line.slice(0, 2).trim();
      const fields = layout.filter(f => f.record_code.padStart(2, '0') === recordCode);
      const parsedLine = { record_code: recordCode };
      for (const field of fields) {
        const start = field.field_position - 1;
        const end = start + field.field_length;
        parsedLine[field.field_description] = line.slice(start, end).trim();
      }
      parsed.push(parsedLine);
    }
    const structured = await transformToStructuredJSON(parsed);


    // --- Start Generate and write structured JSON with flat file name to CleoHarmony Directory for Invex upload ---
    // try {
    //   writeStructuredJSON(structured, flatFileObj.originalname);
    // } catch (err) {
    //   console.error('Error writing structured JSON in /upload:', err);
    // }
    // --- END Send To CleoHarmony ---

    res.json({ parsed, layout });

  } catch (error) {
    console.error('Parsing error:', error);
    res.status(500).json({ error: 'Failed to parse files' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
