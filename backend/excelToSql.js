const xlsx = require('xlsx');
const fs = require('fs');

function excelToSqlInsert(filePath, tableName = '856decode') {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  // Skip header row (assumed to be first row)
  const dataRows = rows.slice(1);

  const sqlStatements = dataRows.map(row => {
    // Escape single quotes for SQL
    const esc = val => (val === null || val === undefined ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`);
    // Columns A-K (0-10)
    return `INSERT INTO "${tableName}" (fieldtransaction, code, description, position, length, type, id, elem_id, value, tad_item, codes_comments) VALUES (${esc(row[0])}, ${esc(row[1])}, ${esc(row[2])}, ${row[3] || 'NULL'}, ${row[4] || 'NULL'}, ${esc(row[5])}, ${esc(row[6])}, ${esc(row[7])}, ${esc(row[8])}, ${esc(row[9])}, ${esc(row[10])});`;
  });

  // Write to a .sql file
  fs.writeFileSync('insert_856decode.sql', sqlStatements.join('\n'), 'utf8');
  console.log('SQL insert statements written to insert_856decode.sql');
}

// Usage:
// excelToSqlInsert('yourfile.xlsx');
module.exports = excelToSqlInsert;