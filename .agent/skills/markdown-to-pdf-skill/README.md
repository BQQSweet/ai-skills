# Markdown 转 PDF Skill

> 将 Markdown 文档转换为专业的 PDF 文件

---

## 🎯 功能特性

✅ **简单易用** - 一条命令完成转换  
✅ **样式丰富** - 支持自定义 CSS 和多种预设主题  
✅ **中文友好** - 完美支持中文字体  
✅ **代码高亮** - 多种代码高亮主题  
✅ **批量转换** - 支持批量处理多个文件  
✅ **目录生成** - 自动生成文档目录

---

## 📦 安装依赖

### macOS

```bash
brew install pandoc
brew install basictex  # 可选,更好的 PDF 支持
```

### Windows

```bash
choco install pandoc
choco install miktex
```

### Linux

```bash
sudo apt-get install pandoc texlive-xetex texlive-lang-chinese
```

---

## 🚀 快速开始

### 方式1：使用 AI 助手

```
请把这个文件转成 PDF: /path/to/document.md
```

### 方式2：使用脚本

```bash
# 基础转换
./scripts/convert.sh document.md

# 带目录
./scripts/convert.sh document.md --toc

# 自定义样式
./scripts/convert.sh document.md output.pdf \
  --toc --style zenburn --fontsize 11pt
```

### 方式3：直接使用 Pandoc

```bash
pandoc document.md -o document.pdf \
  --pdf-engine=xelatex \
  --variable mainfont="PingFang SC"
```

---

## 📖 使用示例

### 示例1：转换需求文档

```bash
./scripts/convert.sh requirement.md \
  --toc \
  --title "需求设计文档" \
  --author "张三" \
  --style tango
```

### 示例2：批量转换

```bash
./scripts/batch-convert.sh ./docs --toc --recursive
```

### 示例3：自定义样式

```bash
./scripts/convert.sh document.md \
  --css custom-style.css \
  --paper a4 \
  --margin 2cm
```

---

## 🎨 样式主题

### 代码高亮主题

- `tango` - 明亮清晰（推荐）
- `zenburn` - 深色护眼
- `pygments` - 经典风格
- `kate` - KDE 风格
- `monochrome` - 黑白简约

### 纸张大小

- `a4` - A4 纸（默认）
- `letter` - 美国信纸
- `a3` - A3 纸

---

## 📁 文件结构

```
markdown-to-pdf-skill/
├── SKILL.md              # Skill 指令
├── README.md             # 本文件
└── scripts/
    ├── convert.sh        # 单文件转换脚本
    └── batch-convert.sh  # 批量转换脚本
```

---

## ⚠️ 常见问题

### Q: 中文显示乱码？

A: 添加中文字体参数：

```bash
--variable mainfont="PingFang SC"  # macOS
--variable mainfont="Microsoft YaHei"  # Windows
```

### Q: 代码块不高亮？

A: 添加高亮参数：

```bash
--highlight-style=tango
```

### Q: 图片无法显示？

A: 确保图片路径正确,建议使用绝对路径

### Q: 表格超出页面？

A: 减小字体或使用横向页面：

```bash
--fontsize 10pt
--variable geometry:landscape
```

---

## 🔗 相关链接

- [Pandoc 官方文档](https://pandoc.org/MANUAL.html)
- [LaTeX 字体配置](https://www.overleaf.com/learn/latex/Font_sizes,_families,_and_styles)

---

## 💡 配合其他 Skill 使用

### 与需求设计文档生成器配合

1. 使用需求设计文档生成器生成 Markdown 文档
2. 使用本 Skill 将文档转换为 PDF

**示例：**

```
1. 我想生成一个任务管理系统的需求文档
   → 使用 requirement-design-skill 生成 requirement.md

2. 请把需求文档转成 PDF
   → 使用 markdown-to-pdf-skill 转换为 requirement.pdf
```

---

**让文档分享更专业！📄✨**
