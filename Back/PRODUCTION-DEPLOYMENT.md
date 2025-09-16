# 生产环境部署指南

## 数据库迁移完成 ✅

您的本地数据库已成功迁移到远程数据库：
- **远程数据库**: `101.32.59.153:5432`
- **数据库名**: `lctmr_production`
- **用户**: `web_app`

## 生产环境配置

### 1. 环境变量设置

在生产服务器上，请设置以下环境变量（**不要使用文件**）：

```bash
# 数据库配置
export NODE_ENV=production
export DB_HOST=101.32.59.153
export DB_PORT=5432
export DB_USER=web_app
export DB_PASSWORD='Dslr*2025#app'
export DB_NAME=lctmr_production
export DB_SSL=false

# JWT配置
export JWT_SECRET='7YtYAMJUa4LaqChbkV0iN5IMSHvaBCVtBmUktZX3E8JOG0i+4TShH5vXl2HhleUMNITi4thFiYv8UFbdiazkqA=='
export JWT_EXPIRES_IN=24h

# 前端配置
export FRONTEND_URL=http://your-domain.com
export API_URL=http://your-domain.com/api
```

### 2. 启动生产应用

```bash
# 设置环境变量后启动
NODE_ENV=production node server/server.js
```

### 3. 验证迁移

您可以通过以下方式验证迁移是否成功：

1. **检查数据库连接**：
   ```bash
   psql -U web_app -h 101.32.59.153 -d lctmr_production -c "SELECT COUNT(*) FROM profiles;"
   ```

2. **检查应用日志**：启动应用后查看控制台输出，应该显示：
   ```
   📊 数据库配置: postgresql (production)
   🔗 连接: web_app@101.32.59.153:5432/lctmr_production
   ✅ 数据库连接成功
   ```

## 安全注意事项

1. **环境变量安全**：确保生产环境的敏感信息（密码、密钥）只通过环境变量设置，不要存储在文件中
2. **备份文件**：已创建的备份文件 `remote_db_backup_final.dump` 和 `local_data_for_migration.dump` 请妥善保管
3. **访问控制**：确保只有授权人员能够访问生产数据库

## 回滚方案

如果需要回滚到之前的数据库状态：

```bash
# 停止应用
# 恢复之前的备份
pg_restore -U web_app -h 101.32.59.153 -d lctmr_production -v remote_db_backup_final.dump
```

## 完成状态

- ✅ 远程数据库已清理
- ✅ 本地数据已迁移到远程数据库
- ✅ 代码已更新并推送到GitHub
- ✅ 敏感配置文件已删除
- ✅ .gitignore已更新

您的数据库迁移已成功完成！🎉
