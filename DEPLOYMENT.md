# 智能相册应用部署指南

## 环境要求

### 1. 环境变量
必需的环境变量：
- `SESSION_SECRET`: 用于加密会话数据
  - 示例：使用随机字符串，如 `openssl rand -base64 32`
- `DATABASE_URL`（可选）: 如果使用PostgreSQL数据库而不是内存存储

### 2. 系统依赖
必需的系统依赖：
- ffmpeg: 用于视频生成功能
  ```bash
  # 在基于Debian/Ubuntu的系统上安装
  apt-get update && apt-get install -y ffmpeg
  
  # 在基于RHEL/CentOS的系统上安装
  yum install -y ffmpeg
  ```

### 3. 文件系统要求
应用需要以下文件夹：
- `uploads/`: 用于存储上传的照片
- `temp/`: 用于视频生成时的临时文件

确保这些文件夹具有适当的权限：
```bash
mkdir -p uploads temp
chmod 755 uploads temp
```

## 应用功能

### 1. 用户认证
- 支持用户注册和登录
- 使用会话进行身份验证

### 2. 照片管理
- 支持照片上传
- 支持添加标签、描述、事件和位置信息
- 支持按标签筛选照片

### 3. 视频生成
- 支持选择多张照片生成视频
- 支持自定义：
  - 转场效果（淡入淡出、滑动、缩放）
  - 排序方式（按上传时间、按事件、自定义顺序）
  - 字幕显示
  - 持续时间设置

## 技术栈

### 前端
- React
- TanStack Query
- shadcn/ui 组件库
- Tailwind CSS

### 后端
- Express.js
- Passport.js（认证）
- multer（文件上传）
- ffmpeg（视频处理）

## 部署步骤

1. 克隆代码库
2. 安装 Node.js 依赖：
   ```bash
   npm install
   ```

3. 设置环境变量：
   ```bash
   export SESSION_SECRET="your-secret-here"
   # 如果使用PostgreSQL
   export DATABASE_URL="postgresql://..."
   ```

4. 创建必要的文件夹：
   ```bash
   mkdir -p uploads temp
   chmod 755 uploads temp
   ```

5. 构建前端资源：
   ```bash
   npm run build
   ```

6. 启动应用：
   ```bash
   # 开发环境
   npm run dev
   
   # 生产环境
   npm run start
   ```

## 注意事项

1. 存储
   - 默认使用内存存储，重启后数据会丢失
   - 生产环境建议使用PostgreSQL数据库

2. 文件管理
   - 定期清理 `temp/` 目录下的临时文件
   - 监控 `uploads/` 目录的磁盘使用情况

3. 安全性
   - 确保 `SESSION_SECRET` 使用强随机值
   - 确保文件上传限制适当配置

4. 性能
   - 视频生成是CPU密集型操作
   - 建议限制并发视频生成请求
   - 考虑使用队列系统处理视频生成任务

## 故障排除

1. 视频生成失败
   - 检查 ffmpeg 是否正确安装
   - 检查临时目录权限
   - 检查磁盘空间

2. 上传失败
   - 检查 `uploads/` 目录权限
   - 检查文件大小限制配置

3. 认证问题
   - 检查 SESSION_SECRET 是否正确设置
   - 检查会话存储配置
