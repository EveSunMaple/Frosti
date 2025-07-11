#!/bin/bash

UPSTREAM_REPO="https://github.com/EveSunMaple/Frosti.git"
TEMP_DIR="frosti_temp_update"

C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_BLUE='\033[0;34m'
C_NC='\033[0m'

echo -e "${C_BLUE}=========================================${C_NC}"
echo -e "${C_BLUE}      Frosti 项目更新辅助脚本      ${C_NC}"
echo -e "${C_BLUE}=========================================${C_NC}"

echo -e "${C_YELLOW}⚠️  警告: 此脚本将从官方仓库拉取最新文件并覆盖您的本地文件。${C_NC}"
echo "我们推荐您在更新前备份项目，或确保所有修改都已提交到 Git。"
echo "此脚本会根据 \`.updateignore\` 文件来保护您的核心内容。"
echo ""
read -p "您是否理解风险并希望继续？(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "操作已取消。"
    exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo -e "${C_RED}❌ 错误: 您有未提交的本地修改。${C_NC}"
  echo "为了安全起见，请先提交您的修改，然后再运行此脚本。"
  exit 1
fi
echo -e "${C_GREEN}✅ 本地Git状态干净，准备开始更新。${C_NC}"

echo -e "\n${C_BLUE}第一步: 正在从 GitHub 克隆最新的 Frosti 仓库...${C_NC}"
rm -rf "$TEMP_DIR"
git clone --depth 1 "$UPSTREAM_REPO" "$TEMP_DIR"
if [ $? -ne 0 ]; then
  echo -e "${C_RED}❌ 克隆失败，请检查您的网络连接或 Git 配置。${C_NC}"
  exit 1
fi
echo -e "${C_GREEN}✅ 最新代码克隆成功！${C_NC}"

echo -e "\n${C_BLUE}第二步: 正在安全地更新您的项目文件 (仅添加和覆盖)...${C_NC}"
rsync -av --exclude-from='.updateignore' "$TEMP_DIR/" .
if [ $? -ne 0 ]; then
  echo -e "${C_RED}❌ 文件更新失败。${C_NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi
echo -e "${C_GREEN}✅ 文件更新完成！${C_NC}"

echo -e "\n${C_BLUE}第三步: 正在智能删除官方已移除的文件 (不会影响您忽略的文件)...${C_NC}"
DELETE_IGNORE_FILE=".deleteignore.tmp"
cp .updateignore "$DELETE_IGNORE_FILE"
echo "正在进行干预式删除..."
rsync -avn --delete --exclude-from='.updateignore' "$TEMP_DIR/" . | grep 'deleting ' | while read -r line ; do
    file_to_delete=$(echo "$line" | sed 's/deleting //')
    if [ -d "$file_to_delete" ]; then
        if [ -z "$(ls -A "$file_to_delete")" ]; then
            echo "删除空目录: $file_to_delete"
            rm -r "$file_to_delete"
        else
            echo "跳过非空目录: $file_to_delete"
        fi
    else
        echo "删除文件: $file_to_delete"
        rm -f "$file_to_delete"
    fi
done
echo -e "${C_GREEN}✅ 已废弃文件清理完成。${C_NC}"

echo -e "\n${C_BLUE}第四步: 正在清理所有残留的空文件夹...${C_NC}"
find . -type d -empty -delete
echo -e "${C_GREEN}✅ 空文件夹清理完毕！${C_NC}"

echo -e "\n${C_BLUE}第五步: 正在清理临时文件...${C_NC}"
rm -rf "$TEMP_DIR"
echo -e "${C_GREEN}✅ 清理完毕！${C_NC}"

echo -e "\n${C_BLUE}第六步: 正在使用 pnpm 安装/更新依赖...${C_NC}"
if ! command -v pnpm &> /dev/null; then
    echo -e "${C_YELLOW}⚠️  警告: 未找到 pnpm 命令，请手动安装依赖。${C_NC}"
    echo "您可以运行: npm install -g pnpm && pnpm install"
else
    pnpm install
    if [ $? -ne 0 ]; then
      echo -e "${C_RED}❌ 依赖安装失败，请手动运行 'pnpm install' 检查问题。${C_NC}"
      exit 1
    fi
    echo -e "${C_GREEN}✅ 依赖安装完成！${C_NC}"
fi

echo -e "\n${C_GREEN}🎉 更新流程全部完成！${C_NC}"
echo "现在您可以启动项目，检查更新后的效果了。"

exit 0