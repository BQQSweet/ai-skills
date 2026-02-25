---
name: markdown-to-pdf
description: 将 Markdown 文档转换为专业的 PDF 文件,支持自定义样式、目录生成和多种导出选项
---

# Markdown 转 PDF Skill

## 📋 概述

这个 Skill 帮助你将 Markdown 文档转换为专业的 PDF 文件。支持自定义样式、自动生成目录、代码高亮等功能。

## 🎯 使用场景

- 将需求文档导出为 PDF 分享给客户
- 生成项目报告的 PDF 版本
- 将技术文档转换为可打印格式
- 批量转换多个 Markdown 文件

## 🔧 技术方案

### 方案对比

| 方案                   | 优点                         | 缺点         | 推荐度     |
| ---------------------- | ---------------------------- | ------------ | ---------- |
| **Pandoc**             | 功能强大,样式可定制,支持模板 | 需要安装依赖 | ⭐⭐⭐⭐⭐ |
| **markdown-pdf (npm)** | 简单易用,Node.js 生态        | 样式定制有限 | ⭐⭐⭐⭐   |
| **wkhtmltopdf**        | HTML→PDF 转换好              | 需要额外安装 | ⭐⭐⭐     |
| **浏览器打印**         | 无需安装,所见即所得          | 自动化程度低 | ⭐⭐       |

**推荐使用 Pandoc**：功能最强大,样式最可控

## 🚀 使用流程

### 步骤 1：检查环境

**你必须首先检查系统是否已安装 Pandoc：**

```bash
pandoc --version
```

如果未安装,提示用户安装：

**macOS:**

```bash
brew install pandoc
brew cask install basictex # 可选,用于更好的 PDF 支持
```

**其他系统:**

- Windows: 下载安装包 https://pandoc.org/installing.html
- Linux: `sudo apt-get install pandoc texlive`

### 步骤 2：询问用户需求

**你必须询问以下问题：**

1. **要转换的文件**：
   - 单个文件路径
   - 或多个文件路径
   - 或整个目录

2. **输出选项**：
   - PDF 文件名（默认：与源文件同名）
   - 输出目录（默认：与源文件同目录）

3. **样式选项**：
   - 是否需要添加 PDF 样式：是 / 否（**默认：使用内置企业通用样式 `styles/common.tex`**）
   - 如果用户需要自定义或切换风格,提供以下选项：
     - **极简专业 (Minimalist)**：黑灰配色,简洁报头
     - **商务蓝色 (Business Blue)**：深蓝页眉,现代感强
     - **学术规范 (Academic)**：标准论文格式,注重页码
   - 纸张大小：A4 / Letter / A3
   - 页边距：默认 / 窄边距 / 宽边距
   - 字体大小：10pt / 11pt / 12pt（默认）
   - 是否生成目录：是 / 否

4. **高级选项**（可选）：
   - 自定义 CSS 样式（仅限 HTML 引擎）
   - 页眉页脚
   - 代码高亮主题

### 步骤 3：执行转换

**基础转换命令：**

```bash
pandoc input.md -o output.pdf \
  --pdf-engine=xelatex \
  --variable mainfont="PingFang SC" \
  --variable monofont="Menlo" \
  --highlight-style=tango
```

**带目录的转换：**

```bash
pandoc input.md -o output.pdf \
  --pdf-engine=xelatex \
  --toc \
  --toc-depth=3 \
  --variable mainfont="PingFang SC" \
  --variable monofont="Menlo" \
  --highlight-style=tango
```

**自定义样式的转换：**

```bash
pandoc input.md -o output.pdf \
  --pdf-engine=xelatex \
  --toc \
  --variable mainfont="PingFang SC" \
  --variable monofont="Menlo" \
  --variable fontsize=12pt \
  --variable geometry:margin=2.5cm \
  --variable papersize=a4 \
  --highlight-style=tango \
  --metadata title="文档标题" \
  --metadata author="作者名称" \
  --metadata date="$(date +%Y-%m-%d)"
```

**使用自定义 CSS：**

```bash
pandoc input.md -o output.pdf \
  --pdf-engine=wkhtmltopdf \
  --css=custom-style.css
```

### 步骤 4：验证输出

转换完成后：

1. 检查 PDF 文件是否生成成功
2. 验证文件大小是否合理
3. 提示用户打开查看

## 📝 转换脚本

**你可以使用 `scripts/convert.sh` 脚本进行转换：**

```bash
./scripts/convert.sh <input.md> [output.pdf] [options]
```

**选项：**

- `--toc`: 生成目录
- `--style <theme>`: 代码高亮主题（tango/pygments/kate/monochrome/espresso/zenburn/haddock）
- `--paper <size>`: 纸张大小（a4/letter/a3）
- `--margin <size>`: 页边距（如 2.5cm）

## 🎨 样式定制

### 预设样式模板

**0. 企业通用样式 (Default / Common)**

- **文件路径**：`./styles/common.tex`
- **特点**：包含专业封面、企业蓝主题色、表格交替行颜色、代码块美化及页眉页脚。
- **使用建议**：当用户没有明确样式偏好时,**必须优先推荐并默认使用此样式**。

当用户选择特定风格时,请生成对应的 `pdf-style.tex` 文件并将其应用于转换。

**1. 极简专业 (Minimalist)**

- 特点：灰度配色,无框设计,适合正式报告。
- `pdf-style.tex` 内容：

```latex
\usepackage{fancyhdr}
\usepackage{xcolor}
\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0.4pt}
\fancyhead[L]{\textcolor{gray}{Document Report}}
\fancyhead[R]{\textcolor{gray}{\today}}
\fancyfoot[C]{\thepage}
```

**2. 商务蓝色 (Business Blue)**

- 特点：深蓝色标题,现代感页边距。
- `pdf-style.tex` 内容：

```latex
\usepackage{fancyhdr}
\usepackage{xcolor}
\usepackage{titlesec}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\textcolor{blue!70!black}{Project Documentation}}
\fancyhead[R]{\thepage}
\titleformat{\section}{\color{blue!70!black}\normalfont\Large\bfseries}{\thesection}{1em}{}
\titleformat{\subsection}{\color{blue!70!black}\normalfont\large\bfseries}{\thesubsection}{1em}{}
```

**3. 学术规范 (Academic)**

- 特点：标准页码,首行缩进,适合论文。
- `pdf-style.tex` 内容：

```latex
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[C]{\itshape \leftmark}
\fancyfoot[C]{\thepage}
\renewcommand{\headrulewidth}{0pt}
\usepackage[indentafter]{indentfirst}
\setlength{\parindent}{2em}
```

### 应用样式文件

在转换时增加 `--include-in-header=pdf-style.tex` 选项：

```bash
pandoc input.md -o output.pdf \
  --pdf-engine=xelatex \
  --include-in-header=pdf-style.tex \
  --variable mainfont="PingFang SC"
```

### 自定义 CSS 示例

创建 `custom-style.css`：

```css
body {
  font-family: "PingFang SC", "Helvetica Neue", Arial, sans-serif;
  font-size: 12pt;
  line-height: 1.6;
  color: #333;
}

h1 {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.3em;
}

h2 {
  color: #34495e;
  border-bottom: 1px solid #bdc3c7;
  padding-bottom: 0.2em;
}

code {
  background-color: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: "Menlo", "Monaco", monospace;
}

pre {
  background-color: #2d2d2d;
  color: #f8f8f2;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

th {
  background-color: #3498db;
  color: white;
}

blockquote {
  border-left: 4px solid #3498db;
  padding-left: 1em;
  color: #555;
  font-style: italic;
}
```

## 🔄 批量转换

**转换整个目录的所有 Markdown 文件：**

```bash
for file in *.md; do
  pandoc "$file" -o "${file%.md}.pdf" \
    --pdf-engine=xelatex \
    --toc \
    --variable mainfont="PingFang SC"
done
```

**或使用脚本：**

```bash
./scripts/batch-convert.sh /path/to/markdown/files
```

## ⚠️ 常见问题

### 问题 1：中文显示乱码

**原因**：未指定中文字体

**解决**：

```bash
--variable mainfont="PingFang SC"  # macOS
--variable mainfont="Microsoft YaHei"  # Windows
--variable mainfont="Noto Sans CJK SC"  # Linux
```

### 问题 2：代码块样式不好看

**原因**：未启用代码高亮

**解决**：

```bash
--highlight-style=tango
```

可选主题：tango, pygments, kate, monochrome, espresso, zenburn, haddock

### 问题 3：图片无法显示

**原因**：图片路径不正确（相对路径问题）

**解决**：

- 使用绝对路径
- 或确保图片与 Markdown 文件在同一目录

### 问题 4：PDF 文件过大

**原因**：图片未压缩

**解决**：

- 转换前压缩图片
- 使用 `--dpi=150` 降低图片分辨率

### 问题 5：表格超出页面宽度

**原因**：表格列太多或内容太长

**解决**：

- 调整表格内容
- 使用横向页面：`--variable geometry:landscape`
- 减小字体：`--variable fontsize=10pt`

## 📦 依赖安装

### macOS

```bash
# 安装 Pandoc
brew install pandoc

# 安装 LaTeX（可选,用于更好的 PDF 支持）
brew install basictex

# 安装中文字体支持
sudo tlmgr install collection-langchinese
```

### Windows

```bash
# 使用 Chocolatey
choco install pandoc
choco install miktex

# 或下载安装包
# https://pandoc.org/installing.html
# https://miktex.org/download
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install pandoc
sudo apt-get install texlive-xetex
sudo apt-get install texlive-lang-chinese
```

## 🎯 使用示例

### 示例 1：简单转换

**用户**：把这个文件转成 PDF

```
/path/to/document.md
```

**AI 执行**：

```bash
pandoc /path/to/document.md -o /path/to/document.pdf \
  --pdf-engine=xelatex \
  --variable mainfont="PingFang SC"
```

### 示例 2：带目录的专业文档

**用户**：生成带目录的 PDF,使用商务风格

**AI 执行**：

```bash
pandoc document.md -o document.pdf \
  --pdf-engine=xelatex \
  --toc \
  --toc-depth=3 \
  --variable mainfont="PingFang SC" \
  --variable fontsize=12pt \
  --variable geometry:margin=2.5cm \
  --variable papersize=a4 \
  --highlight-style=tango \
  --metadata title="需求设计文档" \
  --metadata author="张三" \
  --metadata date="2026-02-12"
```

### 示例 3：批量转换

**用户**：把 examples 目录下所有 md 文件转成 PDF

**AI 执行**：

```bash
cd /path/to/examples
for file in *.md; do
  echo "Converting $file..."
  pandoc "$file" -o "${file%.md}.pdf" \
    --pdf-engine=xelatex \
    --toc \
    --variable mainfont="PingFang SC"
done
echo "转换完成！"
```

## 🔧 高级功能

### 1. 添加页眉页脚

创建 `header.tex`：

```latex
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhead[L]{需求设计文档}
\fancyhead[R]{\today}
\fancyfoot[C]{\thepage}
```

使用：

```bash
pandoc input.md -o output.pdf \
  --include-in-header=header.tex
```

### 2. 自定义封面

创建 `cover.md`：

```markdown
---
title: "项目需求设计文档"
author: "张三"
date: "2026-02-12"
---

\newpage
```

合并转换：

```bash
pandoc cover.md document.md -o output.pdf
```

### 3. 使用模板

```bash
pandoc input.md -o output.pdf \
  --template=custom-template.tex
```

## 📚 相关资源

- Pandoc 官方文档: https://pandoc.org/MANUAL.html
- LaTeX 字体配置: https://www.overleaf.com/learn/latex/Font_sizes,_families,_and_styles
- 代码高亮主题预览: https://pandoc.org/demo/example9/pandocs-markdown.html

## ✅ 执行检查清单

转换前检查：

- [ ] Pandoc 已安装
- [ ] 源文件路径正确
- [ ] 图片路径可访问
- [ ] 输出目录有写权限

转换后验证：

- [ ] PDF 文件生成成功
- [ ] 文件大小合理
- [ ] 中文显示正常
- [ ] 图片显示正常
- [ ] 代码高亮正常
- [ ] 目录生成正确（如果启用）
