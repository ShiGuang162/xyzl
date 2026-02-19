// 数据库连接配置
const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Mysql@123456',  // 使用正确的密码
  database: process.env.DB_NAME || 'xyzl_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    // 不抛出错误，以便服务器可以启动，即使数据库暂时不可用
    console.error('注意: 数据库连接失败，后端将无法访问数据。请确保MySQL服务正在运行并正确配置了凭据。');
  }
}

// 执行查询的通用函数
async function query(sql, params) {
  try {
    // 直接使用pool.query，它能更好地处理参数
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
}

module.exports = {
  query,
  testConnection,
  pool
};