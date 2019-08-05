### 功能介绍

- 核心

  - 录制并自动生成测试脚本
  - 支持单 tab、多 tab 录制
  - 支持浏览器前进后退操作(todo)
  - 播放测试脚本
  - 查看测试报告（可配置发邮箱）
  - 保存脚本、上传脚本

- 额外

  - 支持动态加载的页面测试
  - 根据实际的网络环境加不同的启动参数

- 界面
  - web
  - chrome 插件

---

### 数据源

监听 --> 坐标 --> 元素 --> xpath

---

### UI

- 按钮

  - target url
  - 开始录制
  - text
  - 截图
  - 结束录制
  - 重播
  - 查看报告
  - 保存脚本
  - 上传脚本

- 脚本编辑区

---

### 流程-迭代 1

#### 录制

启动录制器 --> web 界面打开 --> 点击「target url」--> 输入 url, 点击确认 --> 点击「开始录制」--> chromium 启动, 用户操作 --> （点击「截图」）--> 捕获用户行为 --> 翻译用户操作 --> 实时显示 --> 点击「结束录制」

#### 播放

点击「播放」--> 执行录制脚本 --> chromium 启动, 开始自动测试 --> 用户观看操作 --> 结束

#### 查看测试报告

点击「查看报告」--> web 界面打开 --> （显示截图结果）

#### 保存脚本

点击「保存脚本」--> 录制脚本被下载到本地

#### 上传脚本

- todo

---

### 技术细节

#### 架构组成

- N1: 用户行为捕获服务 demo.js、WebSocket client
- N2: WebSocket proxy server
- N3: HTTP server
- N4: 页面中的 WebSocket client

数据的流向：N1 --> N2 --> N4

#### 启动录制器

- 以一条命令的方式启动录制器
- 启动 N2
- 启动 N3

#### web 界面打开

- 自动打开，渲染页面和启动 N4

#### 点击「target url」--> 输入 url, 点击确认

- url 写入文件保存

#### 点击「开始录制」

- 生成新的代码模版到脚本编辑区
- 从文件中读取 url 并启动 N1

#### chromium 启动, 用户操作

- N1 捕获用户行为 --> 翻译成代码 --> N2 --> N4 --> 实时显示
- 监听事件：click（过滤无效的点击）、输入事件、前进/后退(todo)、关闭/打开页面
- 事件的识别
  - target_self: 先有 click 事件，再有 url change 事件（属于有效 click）
    - 引起 url change 的操作
      - 正常的 target-self 点击
      - newtab、地址栏输入
      - 手动在地址栏输入（不支持）
  - target_blank: targetcreated + popup（属于有效 click）
  - new_tab: targetcreated（newPage(url)）
- 不支持的操作
  - 手动地切换 tab，再点击、输入
  - 直接地址栏输入（注意和 newtab、地址栏输入的区别）
- 过滤无效点击（识别有效点击事件）
- 将用户行为翻译成脚本

#### 点击「结束录制」

- N1 退出

---

# 日志

## 2019-07-24

1. 验证了想法是可行的（实现并跑通测试程序：点击 --> 捕获事件 --> 转发事件消息 --> 实时显示）
2. 遇到的困难：利用 pptr 捕获 click 事件；解决方法：提 issue

## 2019-07-27

1. 攻克根据元素获取 XPath、根据坐标获取元素这两个难题；解决方法：google、参考 firebug

## 2019-07-28

1. 理清流程和大部分技术细节
2. 写 README.md

## 2019-07-30

1. 跑通了核心功能，根据点击获取对应的 XPath
2. 跑通其他事件的捕获（newTab、closeTab、clickTargetBlank）

## 2019-07-31

1. 整理代码、模块化代码
2. 实现带阻塞功能的消息队列，通过在不同回调函数之间的同步控制，实现事件的精准识别（包括：无效点击和有效点击、newTab 和 clickTargetBlank）
3. 解决 pptr 会重复回调；解决方法：添加异常处理、耐心调试
4. 优化阻塞队列的实现

## 2019-08-01

1. 理清用户操作和事件的关系，成功识别 clickTargetSelf 事件。在这里初步总结：用户的每个操作都可能引发一个事件，对于点击、新建窗口、关闭窗口、点击打开窗口、改变 url 这几个操作， pptr 都有相对应的事件（click、clickTargetBlank、newTab、closeTab、URLChange）。但是对于点击原地跳转就没有明确的与之对应的事件，只能借助 URLChange 和 click 组合着来判断，而且难点在于，类似新建窗口和点击打开窗口这两个操作都能触发 newTab 一样，点击原地跳转、新建窗口再地址栏输入、直接地址栏输入这三种操作都会触发 URLChange，因此通过阻塞队列在不同的回调函数之间进行同步，由此来区分
2. 解决因网络环境造成的 clickTargetSelf 识别不准确（漏）；解决方法：观察回调函数之间的逻辑关系，调整他们之间的阻塞时长

## 2019-08-02

1. 重构代码
2. 加注释
3. 添加开发日志
4. 设计好键盘事件的捕获方法：给 input 绑定 FocusEvent 事件（https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent）
5. 设计好 statement.js 模块

## 2019-08-03

1. 解决页面滚动代码的生成问题
2. 初步编写 statement.js, 完成 ClickTargetBlank 事件的翻译

## 2019-08-04

1. 解决难题：click (target_self) 操作会破坏原来的 document，导致无法定位元素、获取 XPath；解决方法：将跳转前的页面的 url 记录下来，用另外一个 pptr 去定位元素、获取 XPath
2. 归档 v0.03

## 2019-08-05

1. 完成 clickTargetBlank、clickTargetSelf、newTab、URLChange、closeTab 事件的翻译
2. 归档 v0.04
3. 待解决问题：WebSocket 可靠的发送方法的实现
