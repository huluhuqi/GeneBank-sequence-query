# 更新日志

## v1.0.0

### 修复

- 修复结果写入异常（resultStore.appendResults 流式更新）
- 修复主题系统颜色层次问题（5 主题重新调整 background/surface/card/input/hover 五层）
- 修复动画系统（统一动画变量、移除全局 * transition、修复 ModuleTransition 的 transition:all）
- 修复粘贴输入（Ctrl+V 全局监听 + activeTarget 路由）
- 修复 Excel 序列解析（TSV 解析器正确处理单元格内引号包裹的换行）
- 修复序列未标准化问题（统一去空白 + 转大写 + IUPAC 校验）

### 优化

- Worker 池并行计算（基于 navigator.hardwareConcurrency）
- k-mer 预筛选（长度过滤 + Set 匹配）
- 任务分块调度（splitArray/chunkIndices）
- 流式结果推送（onProgress 增量回调 + appendResults）
- IndexedDB 结果持久化（saveTask/loadTask/listTasks）
- WASM 加速接口预留（AlignmentEngine 接口）
- 虚拟滚动（vue-virtual-scroller，>100 项启用）
- 碱基级对齐可视化（match/mismatch/gap 颜色编码）
- 多方法筛选（Sliding/Local/ReverseComplement）
- 阈值过滤（minIdentity/maxMismatch）
- Excel 导出（基于 xlsx）
- 首次使用引导（driver.js）
- i18n 国际化（zh-CN/en-US）

### 性能

- 100×100 比对 < 1 秒
- 1000×1000 比对 5~20 秒
- 5000×5000 比对分钟级，UI 不卡死
- Worker 支持暂停/取消/错误恢复
- 大数据保护（单序列 > 1,000,000bp 自动跳过）

### 架构

- 输入系统：SequenceItem 统一数据结构 + 多格式导入器（FASTA/Text/Excel）
- 任务管理：AlignmentScheduler + WorkerPool + 任务历史
- 结果管理：Pinia store + 虚拟滚动 + 筛选排序
- 可视化：ResultTable/ResultCard + AlignmentViewer + ResultDetail
- 主题系统：5 主题 + CSS 变量 + 主题切换动画
- 响应式布局：4 断点（mobile/tablet/desktop/large）

### 开发者

- PerformancePanel 性能监控面板（DEV_MODE 开关）
- 压力测试系统（小/中/大三场景）
- 移除废弃的 vue-router 依赖和 Home.vue/router 目录
- 清理所有 console.log（保留 console.warn/error）
