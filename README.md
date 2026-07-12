# GeneBank Sequence Query

基于 Vue 3 + Web Worker 的多算法生物信息序列比对工具（Multiple Sequence Alignment），支持 Sliding / Local / SnapGene / Reverse Complement 四种算法并行比对。

## 在线演示（Online Demo）

`https://huluhuqi.github.io/GeneBank-sequence-query/`

## 功能特性（Features）

- **多算法并行比对**：Sliding、Local、SnapGene（Needleman-Wunsch DP）、Reverse Complement
- **Web Worker 池**：基于 `navigator.hardwareConcurrency` 的并行计算，最大 8 Worker
- **流式结果更新**：100ms 批量刷新，大数据比对不卡顿
- **多格式导入**：FASTA、纯文本、Excel 双列、Excel 单列、文件拖拽
- **结果可视化**：碱基级对齐视图（Alignment Viewer）、错配高亮、坐标 1-based
- **多主题系统**：Light / Dark / Ocean / Forest / Midnight 五套主题
- **国际化**：zh-CN / en-US 双语
- **导出**：CSV / Excel（含 Result、Statistics、Alignment、Sequences 四个 Sheet）
- **响应式布局**：Mobile / Tablet / Desktop / Large 四断点

## 安装（Installation）

```bash
npm install
```

## 开发（Development）

```bash
npm run dev
```

## 构建（Build）

```bash
npm run build
```

构建产物位于 `dist/` 目录，可部署到任何静态文件服务器。

## 支持格式（Supported Formats）

| 格式 | 扩展名 | 说明 |
|------|--------|------|
| FASTA | `.fasta` `.fa` `.fna` `.fas` | 标准 `>header` 格式 |
| Text | `.txt` | 每行一条序列 |
| CSV | `.csv` | 双列：ID + Sequence |
| TSV | `.tsv` | Tab 分隔 |
| Excel | `.xlsx` | Excel 粘贴双列格式 |

## 技术栈（Tech Stack）

- **前端框架**：Vue 3.4 + TypeScript 5.3
- **构建工具**：Vite 5.0
- **状态管理**：Pinia 2.1
- **UI 组件库**：Naive UI 2.38
- **样式**：Tailwind CSS 3.4 + CSS 变量主题系统
- **Web Worker**：Worker Pool 并行计算
- **部署**：GitHub Pages + GitHub Actions

## 算法说明（Algorithms）

| 算法 | 适用场景 | 说明 |
|------|----------|------|
| Sliding | 短序列（≤100bp） | 滑动窗口 + k-mer seed 预筛选 |
| Local | 中序列（101-1000bp） | Seed + Extend 局部比对 |
| SnapGene | 长序列（>1000bp） | Needleman-Wunsch 动态规划 |
| Reverse Complement | 反向互补检测 | 始终启用 |

统一 identity 计算：`match / (match + mismatch + gap) × 100`

## 许可证（License）

MIT
