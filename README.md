# 好聚乐龄微信小程序

好聚乐龄是一款专为老年人设计的社区活动平台，旨在促进老年人社交互动、丰富晚年生活。

## 项目简介

本项目是基于微信小程序云开发的全栈应用，主要功能包括：

- 活动发布与参与
- 社区互动
- 个人信息管理
- 组织管理
- 消息通知
- 位置服务

## 技术栈

- 前端：微信小程序原生框架
- 后端：云开发（云函数、数据库、云存储）
- 工具库：封装了常用工具函数

## 安装与运行

1. 克隆代码到本地
   ```
   git clone https://github.com/woody022/haojuleling.git
   ```

2. 安装依赖（如果有）
   ```
   npm install
   ```

3. 导入到微信开发者工具
   - 填入您的AppID
   - 开通云开发
   - 创建云环境并替换project.config.json中的云环境ID

4. 部署云函数
   - 在cloudfunctions目录右键选择"上传并部署：云端安装依赖"

## 项目结构

```
project/
├── cloudfunctions/         # 云函数目录
│   ├── user/               # 用户相关云函数
│   ├── activity/           # 活动相关云函数
│   └── notification/       # 通知相关云函数
├── miniprogram/            # 小程序源码
│   ├── pages/              # 页面
│   ├── components/         # 组件
│   ├── api/                # API接口
│   ├── src/                # 源码目录
│   │   └── utils/          # 工具类目录
│   ├── utils/              # 工具函数
│   └── common/             # 公共函数和服务
└── package.json            # 项目配置
```

## 云函数说明

项目使用云函数作为后端服务，主要有以下几个云函数：

1. **user** - 用户相关功能
   - 登录注册
   - 获取用户信息
   - 更新用户信息
   - VIP管理

2. **activity** - 活动相关功能
   - 创建活动
   - 获取活动列表
   - 活动详情
   - 参与活动管理

3. **notification** - 通知相关功能
   - 发送通知
   - 获取通知列表
   - 标记通知已读

## 工具类使用说明

项目提供了常用的工具类（src/utils/common.js），包含以下功能：

- 数据验证
- 对象操作
- 日期和数字格式化
- 随机值生成
- 函数控制（防抖、节流）
- URL处理
- 树结构操作

详细使用方法请参考 [工具类文档](src/utils/README.md)

## 贡献指南

如果您想为项目做出贡献，请遵循以下步骤：

1. Fork 本仓库
2. 创建新的分支 (`git checkout -b feature/your-feature`)
3. 提交您的更改 (`git commit -m 'Add some feature'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 提交 Pull Request

## 许可证

[ISC](LICENSE)