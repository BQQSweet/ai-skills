#!/bin/bash

# Markdown 转 PDF 转换脚本
# 用法: ./convert.sh <input.md> [output.pdf] [options]

set -e

# 默认配置
PDF_ENGINE="xelatex"
MAINFONT="PingFang SC"
MONOFONT="Menlo"
FONTSIZE="12pt"
PAPERSIZE="a4"
MARGIN="2.5cm"
HIGHLIGHT_STYLE="tango"
TOC=false
TOC_DEPTH=3

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 帮助信息
show_help() {
    cat << EOF
Markdown 转 PDF 转换脚本

用法:
    ./convert.sh <input.md> [output.pdf] [options]

参数:
    input.md        输入的 Markdown 文件（必需）
    output.pdf      输出的 PDF 文件（可选，默认与输入文件同名）

选项:
    --toc                   生成目录
    --toc-depth <n>         目录深度（默认: 3）
    --style <theme>         代码高亮主题（默认: tango）
                           可选: tango, pygments, kate, monochrome, espresso, zenburn, haddock
    --paper <size>          纸张大小（默认: a4）
                           可选: a4, letter, a3
    --margin <size>         页边距（默认: 2.5cm）
    --fontsize <size>       字体大小（默认: 12pt）
                           可选: 10pt, 11pt, 12pt, 14pt
    --title <title>         文档标题
    --author <author>       文档作者
    --date <date>           文档日期（默认: 当前日期）
    --css <file>            自定义 CSS 文件
    --help                  显示此帮助信息

示例:
    # 基础转换
    ./convert.sh document.md

    # 带目录的转换
    ./convert.sh document.md output.pdf --toc

    # 自定义样式
    ./convert.sh document.md --toc --style zenburn --fontsize 11pt

    # 完整配置
    ./convert.sh document.md output.pdf \\
        --toc --style tango --paper a4 --margin 2cm \\
        --title "需求文档" --author "张三"

EOF
}

# 检查 Pandoc 是否安装
check_pandoc() {
    if ! command -v pandoc &> /dev/null; then
        echo -e "${RED}错误: 未找到 Pandoc${NC}"
        echo "请先安装 Pandoc:"
        echo "  macOS:   brew install pandoc"
        echo "  Windows: choco install pandoc"
        echo "  Linux:   sudo apt-get install pandoc"
        exit 1
    fi
    echo -e "${GREEN}✓ Pandoc 已安装: $(pandoc --version | head -n1)${NC}"
}

# 解析参数
INPUT_FILE=""
OUTPUT_FILE=""
TITLE=""
AUTHOR=""
DATE=$(date +%Y-%m-%d)
CUSTOM_CSS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --help)
            show_help
            exit 0
            ;;
        --toc)
            TOC=true
            shift
            ;;
        --toc-depth)
            TOC_DEPTH="$2"
            shift 2
            ;;
        --style)
            HIGHLIGHT_STYLE="$2"
            shift 2
            ;;
        --paper)
            PAPERSIZE="$2"
            shift 2
            ;;
        --margin)
            MARGIN="$2"
            shift 2
            ;;
        --fontsize)
            FONTSIZE="$2"
            shift 2
            ;;
        --title)
            TITLE="$2"
            shift 2
            ;;
        --author)
            AUTHOR="$2"
            shift 2
            ;;
        --date)
            DATE="$2"
            shift 2
            ;;
        --css)
            CUSTOM_CSS="$2"
            shift 2
            ;;
        *)
            if [[ -z "$INPUT_FILE" ]]; then
                INPUT_FILE="$1"
            elif [[ -z "$OUTPUT_FILE" ]]; then
                OUTPUT_FILE="$1"
            else
                echo -e "${RED}错误: 未知参数 '$1'${NC}"
                show_help
                exit 1
            fi
            shift
            ;;
    esac
done

# 检查输入文件
if [[ -z "$INPUT_FILE" ]]; then
    echo -e "${RED}错误: 请指定输入文件${NC}"
    show_help
    exit 1
fi

if [[ ! -f "$INPUT_FILE" ]]; then
    echo -e "${RED}错误: 文件不存在: $INPUT_FILE${NC}"
    exit 1
fi

# 设置输出文件
if [[ -z "$OUTPUT_FILE" ]]; then
    OUTPUT_FILE="${INPUT_FILE%.md}.pdf"
fi

# 检查 Pandoc
check_pandoc

# 构建 Pandoc 命令
PANDOC_CMD="pandoc \"$INPUT_FILE\" -o \"$OUTPUT_FILE\""
PANDOC_CMD="$PANDOC_CMD --pdf-engine=$PDF_ENGINE"
PANDOC_CMD="$PANDOC_CMD --variable mainfont=\"$MAINFONT\""
PANDOC_CMD="$PANDOC_CMD --variable monofont=\"$MONOFONT\""
PANDOC_CMD="$PANDOC_CMD --variable fontsize=$FONTSIZE"
PANDOC_CMD="$PANDOC_CMD --variable geometry:margin=$MARGIN"
PANDOC_CMD="$PANDOC_CMD --variable papersize=$PAPERSIZE"
PANDOC_CMD="$PANDOC_CMD --highlight-style=$HIGHLIGHT_STYLE"

if [[ "$TOC" == true ]]; then
    PANDOC_CMD="$PANDOC_CMD --toc --toc-depth=$TOC_DEPTH"
fi

if [[ -n "$TITLE" ]]; then
    PANDOC_CMD="$PANDOC_CMD --metadata title=\"$TITLE\""
fi

if [[ -n "$AUTHOR" ]]; then
    PANDOC_CMD="$PANDOC_CMD --metadata author=\"$AUTHOR\""
fi

if [[ -n "$DATE" ]]; then
    PANDOC_CMD="$PANDOC_CMD --metadata date=\"$DATE\""
fi

if [[ -n "$CUSTOM_CSS" ]]; then
    if [[ -f "$CUSTOM_CSS" ]]; then
        PANDOC_CMD="$PANDOC_CMD --css=\"$CUSTOM_CSS\""
    else
        echo -e "${YELLOW}警告: CSS 文件不存在: $CUSTOM_CSS${NC}"
    fi
fi

# 显示配置信息
echo -e "${GREEN}开始转换...${NC}"
echo "输入文件: $INPUT_FILE"
echo "输出文件: $OUTPUT_FILE"
echo "纸张大小: $PAPERSIZE"
echo "字体大小: $FONTSIZE"
echo "页边距: $MARGIN"
echo "代码高亮: $HIGHLIGHT_STYLE"
echo "生成目录: $TOC"
echo ""

# 执行转换
echo -e "${YELLOW}执行命令:${NC}"
echo "$PANDOC_CMD"
echo ""

eval $PANDOC_CMD

# 检查结果
if [[ -f "$OUTPUT_FILE" ]]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo ""
    echo -e "${GREEN}✓ 转换成功！${NC}"
    echo "输出文件: $OUTPUT_FILE"
    echo "文件大小: $FILE_SIZE"
    echo ""
    echo "可以使用以下命令打开:"
    echo "  open \"$OUTPUT_FILE\"  # macOS"
    echo "  xdg-open \"$OUTPUT_FILE\"  # Linux"
    echo "  start \"$OUTPUT_FILE\"  # Windows"
else
    echo -e "${RED}✗ 转换失败${NC}"
    exit 1
fi
