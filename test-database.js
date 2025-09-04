/**
 * 数据库连接测试脚本
 * 用于验证生产环境数据库连接是否正常
 */

// 设置生产环境变量
process.env.NODE_ENV = 'production';
process.env.DB_HOST = '101.32.59.153';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'web_app';
process.env.DB_PASSWORD = 'Dslr*2025#app';
process.env.DB_NAME = 'lctmr_production';
process.env.DB_SSL = 'false';

const { connectDatabase, query } = require('./server/config/database');

async function testDatabaseConnection() {
    console.log('🔍 开始测试数据库连接...');
    console.log('========================================');
    
    try {
        // 连接数据库
        await connectDatabase();
        console.log('✅ 数据库连接成功！');
        
        // 测试基本查询
        console.log('\n📊 测试基本查询...');
        const result = await query('SELECT version() as version');
        console.log(`📋 PostgreSQL版本: ${result.rows[0].version.split(' ')[0]}`);
        
        // 检查表是否存在
        console.log('\n📋 检查数据表...');
        const tablesResult = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log('📊 发现的数据表:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });
        
        // 检查用户数据
        console.log('\n👥 检查用户数据...');
        const userCount = await query('SELECT COUNT(*) as count FROM profiles');
        console.log(`👤 用户数量: ${userCount.rows[0].count}`);
        
        const scoreCount = await query('SELECT COUNT(*) as count FROM scores');
        console.log(`🏆 分数记录: ${scoreCount.rows[0].count}`);
        
        const progressCount = await query('SELECT COUNT(*) as count FROM user_progress');
        console.log(`📈 进度记录: ${progressCount.rows[0].count}`);
        
        console.log('\n🎉 数据库测试完成！所有功能正常。');
        
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        console.error('请检查:');
        console.error('1. 数据库服务器是否运行');
        console.error('2. 网络连接是否正常');
        console.error('3. 数据库凭据是否正确');
        process.exit(1);
    } finally {
        // 关闭数据库连接
        const { closeDatabase } = require('./server/config/database');
        await closeDatabase();
        console.log('🔌 数据库连接已关闭');
    }
}

// 运行测试
testDatabaseConnection();
