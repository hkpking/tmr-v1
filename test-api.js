/**
 * API测试脚本
 * 用于验证生产环境API是否正常工作
 */

const http = require('http');

function testAPI() {
    console.log('🔍 开始测试API...');
    console.log('========================================');
    
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/health',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    const req = http.request(options, (res) => {
        console.log(`📊 状态码: ${res.statusCode}`);
        console.log(`📋 响应头:`, res.headers);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📄 响应内容:', data || '(空响应)');
            
            if (res.statusCode === 200) {
                console.log('✅ API测试成功！');
            } else {
                console.log('⚠️ API响应异常，但服务器正在运行');
            }
        });
    });
    
    req.on('error', (err) => {
        console.error('❌ API测试失败:', err.message);
        console.error('请检查服务器是否正在运行');
    });
    
    req.setTimeout(5000, () => {
        console.log('⏰ 请求超时');
        req.destroy();
    });
    
    req.end();
}

// 运行测试
testAPI();
