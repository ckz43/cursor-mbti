# MySQL + MCP 配置指南

## 已完成的配置

### 1. MySQL 数据库
- ✅ MySQL 服务已启动
- ✅ 创建了专用数据库：`mbti_test`
- ✅ 创建了专用用户：`mbti_user`
- ✅ 用户密码：`MbtiPass123!`
- ✅ 创建了测试表：`test_users`

### 2. MCP 服务器
- ✅ 安装了 `@modelcontextprotocol/server-everything`
- ✅ 创建了 MCP 配置文件：`mcp-config.json`
- ✅ 配置了 MySQL 连接参数

### 3. Node.js 连接
- ✅ 安装了 `mysql2` 包
- ✅ 创建了测试脚本：`test-mysql-connection.js`
- ✅ 验证了数据库连接成功

## 使用方法

### 启动 MySQL 服务
```bash
brew services start mysql
```

### 停止 MySQL 服务
```bash
brew services stop mysql
```

### 连接数据库
```bash
mysql -u mbti_user -p mbti_test
# 密码：MbtiPass123!
```

### 测试连接
```bash
node test-mysql-connection.js
```

## 数据库信息
- **主机**: localhost
- **端口**: 3306
- **数据库**: mbti_test
- **用户名**: mbti_user
- **密码**: MbtiPass123!

## MCP 服务器配置

### 安装 MCP MySQL 服务器
```bash
sudo npm install -g sbqfc-mcp-mysql-server
```

### 配置文件
创建了 `mcp-config.json` 配置文件，包含 MySQL 连接信息：
```json
{
  "mcpServers": {
    "mysql": {
      "command": "mcp-mysql",
      "args": [
        "--host", "localhost",
        "--port", "3306",
        "--user", "mbti_user",
        "--database", "mbti_test",
        "--password", "MbtiPass123!"
      ]
    }
  }
}
```

### 测试 MCP 服务器
运行测试脚本验证连接：
```bash
node test-mcp-mysql.js
```

## 故障排除

### 解决 "spawn mysql_mcp_server ENOENT" 错误
如果遇到此错误，说明 MCP 服务器可执行文件未找到。解决方案：

1. 安装正确的 MCP MySQL 服务器包：
   ```bash
   sudo npm install -g sbqfc-mcp-mysql-server
   ```

2. 确认可执行文件路径：
   ```bash
   which mcp-mysql
   # 应该返回: /usr/local/bin/mcp-mysql
   ```

3. 更新配置文件使用正确的命令名 `mcp-mysql`

## 注意事项
1. 确保 MySQL 服务正在运行
2. 密码包含大小写字母、数字和特殊字符，符合 MySQL 密码策略
3. 用户 `mbti_user` 只有 `mbti_test` 数据库的权限，安全性更好
4. 测试脚本使用 ES 模块语法，适配项目配置
5. MCP 配置文件中的密码应该从环境变量读取（生产环境）
6. MCP 服务器通过 stdio 协议通信，不是传统的 HTTP 服务