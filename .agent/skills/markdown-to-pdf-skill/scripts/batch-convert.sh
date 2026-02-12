#!/bin/bash

# 批量转换 Markdown 文件为 PDF
# 用法: ./batch-convert.sh <directory> [options]

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 显示帮助
show_help() {
    cat << EOF
批量 Markdown 转 PDF 脚本

用法:
    ./batch-convert.sh <directory> [options]

参数:
    directory       包含 Markdown 文件的目录

选项:
    --output <dir>  输出目录（默认: 与源文件同目录）
    --toc           生成目录
    --recursive     递归处理子目录
    其他选项与 convert.sh 相同

示例:
    # 转换当前目录所有 md 文件
    ./batch-convert.sh .

    # 递归转换并生成目录
    ./batch-convert.sh ./docs --recursive --toc

EOF
}

# 检查参数
if [[ $# -lt 1 ]] || [[ "$1" == "--help" ]]; then
    show_help
    exit 0
fi

DIRECTORY="$1"
shift

if [[ ! -d "$DIRECTORY" ]]; then
    echo -e "${RED}错误: 目录不存在: $DIRECTORY${NC}"
    exit 1
fi

# 解析选项
OUTPUT_DIR=""
RECURSIVE=false
EXTRA_ARGS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --recursive)
            RECURSIVE=true
            shift
            ;;
        *)
            EXTRA_ARGS="$EXTRA_ARGS $1"
            shift
            ;;
    esac
done

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONVERT_SCRIPT="$SCRIPT_DIR/convert.sh"

if [[ ! -f "$CONVERT_SCRIPT" ]]; then
    echo -e "${RED}错误: 找不到 convert.sh 脚本${NC}"
    exit 1
fi

# 查找 Markdown 文件
if [[ "$RECURSIVE" == true ]]; then
    FILES=$(find "$DIRECTORY" -name "*.md" -type f)
else
    FILES=$(find "$DIRECTORY" -maxdepth 1 -name "*.md" -type f)
fi

FILE_COUNT=$(echo "$FILES" | wc -l | tr -d ' ')

if [[ -z "$FILES" ]] || [[ "$FILE_COUNT" -eq 0 ]]; then
    echo -e "${YELLOW}未找到 Markdown 文件${NC}"
    exit 0
fi

echo -e "${GREEN}找到 $FILE_COUNT 个 Markdown 文件${NC}"
echo ""

# 转换文件
SUCCESS_COUNT=0
FAIL_COUNT=0

while IFS= read -r file; do
    if [[ -z "$file" ]]; then
        continue
    fi
    
    echo -e "${YELLOW}处理: $file${NC}"
    
    # 确定输出文件
    if [[ -n "$OUTPUT_DIR" ]]; then
        mkdir -p "$OUTPUT_DIR"
        BASENAME=$(basename "$file" .md)
        OUTPUT_FILE="$OUTPUT_DIR/$BASENAME.pdf"
    else
        OUTPUT_FILE="${file%.md}.pdf"
    fi
    
    # 执行转换
    if bash "$CONVERT_SCRIPT" "$file" "$OUTPUT_FILE" $EXTRA_ARGS; then
        ((SUCCESS_COUNT++))
        echo -e "${GREEN}✓ 成功${NC}"
    else
        ((FAIL_COUNT++))
        echo -e "${RED}✗ 失败${NC}"
    fi
    echo ""
done <<< "$FILES"

# 显示统计
echo "======================================"
echo -e "${GREEN}转换完成！${NC}"
echo "总计: $FILE_COUNT 个文件"
echo -e "${GREEN}成功: $SUCCESS_COUNT${NC}"
if [[ $FAIL_COUNT -gt 0 ]]; then
    echo -e "${RED}失败: $FAIL_COUNT${NC}"
fi
