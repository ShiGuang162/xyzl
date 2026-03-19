#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const uploadsDir = path.join(__dirname, 'uploads');
  
  const sourceFiles = ['scenics_1_carousel_1.jpg', 'scenics_1_carousel_2.jpg', 'scenics_1_carousel_3.jpg'];
  const destFiles = ['history_1_carousel_1.jpg', 'history_1_carousel_2.jpg', 'history_1_carousel_3.jpg'];
  const imageUrls = [];
  
  for (let i = 0; i < sourceFiles.length; i++) {
    const src = path.join(uploadsDir, sourceFiles[i]);
    const dst = path.join(uploadsDir, destFiles[i]);
    
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      console.log('Copied', sourceFiles[i], 'to', destFiles[i]);
      imageUrls.push('http://localhost:3001/uploads/' + destFiles[i]);
    }
  }
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Mysql@123456',
    database: process.env.DB_NAME || 'xyzl_db'
  });
  
  await connection.query('UPDATE history SET images = ? WHERE id = 1', [JSON.stringify(imageUrls)]);
  if (imageUrls.length > 0) {
    await connection.query('UPDATE history SET image = ? WHERE id = 1', [imageUrls[0]]);
  }
  
  await connection.end();
  console.log('Done!');
}

main().catch(console.error);
