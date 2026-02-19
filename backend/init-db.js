#!/usr/bin/env node

// 数据库初始化脚本
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  console.log('开始初始化数据库...');
  
  try {
    // 创建临时连接用于创建数据库
    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    console.log('连接到MySQL服务器...');
    
    // 创建数据库（如果不存在）
    const dbName = process.env.DB_NAME || 'xyzl_db';
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`数据库 ${dbName} 创建成功或已存在`);
    
    // 切换到目标数据库
    await tempConnection.query(`USE \`${dbName}\`;`);
    
    // 读取并执行schema.sql
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      // 分割SQL语句并逐个执行
      const statements = schemaSQL.split(/;\s*(?=\n)/).filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        const trimmedStmt = statement.trim();
        if (trimmedStmt) {
          try {
            await tempConnection.query(trimmedStmt + ';');
          } catch (stmtErr) {
            // 忽略某些可能的错误（例如重复创建表）
            console.log(`执行SQL语句时可能有警告: ${trimmedStmt.substring(0, 50)}...`);
          }
        }
      }
      
      console.log('数据库表结构创建完成');
    } else {
      console.error(`找不到 schema.sql 文件: ${schemaPath}`);
    }
    
    await tempConnection.end();
    console.log('数据库初始化完成！');
    
  } catch (error) {
    console.error('数据库初始化过程中出现错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本，则执行初始化
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };