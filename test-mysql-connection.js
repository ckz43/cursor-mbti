import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'mbti_user',
      password: process.env.MYSQL_PASSWORD || 'MbtiPass123!',
      database: 'mbti_test'
    });

    console.log('✅ MySQL连接成功!');
    
    // 测试查询
    const [rows] = await connection.execute('SELECT * FROM test_users LIMIT 5');
    console.log('📊 测试查询结果:', rows);
    
    // 插入测试数据
    await connection.execute(
      'INSERT INTO test_users (name, email) VALUES (?, ?)',
      ['测试用户', 'test@example.com']
    );
    console.log('✅ 测试数据插入成功!');
    
    await connection.end();
    console.log('🎉 MySQL数据库连接测试完成!');
  } catch (error) {
    console.error('❌ MySQL连接失败:', error.message);
  }
}

testConnection();