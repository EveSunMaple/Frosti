#!/bin/bash
# Chinese (Simplified) Language File for Frosti Updater

# --- Header ---
MSG_HEADER_TITLE="Frosti 项目更新辅助脚本"

# --- Warnings and Prompts ---
MSG_WARNING_TITLE="⚠️  警告: 此脚本将从官方仓库拉取最新文件并覆盖您的本地文件。"
MSG_WARNING_RECOMMENDATION="我们推荐您在更新前备份项目，或确保所有修改都已提交到 Git。"
MSG_WARNING_IGNORE="此脚本会根据 \`.updateignore\` 文件来保护您的核心内容。"
PROMPT_CONTINUE="您是否理解风险并希望继续？(y/N): "
MSG_CANCELLED="操作已取消。"

# --- Git Status ---
ERR_GIT_DIRTY="❌ 错误: 您有未提交的本地修改。"
ERR_GIT_DIRTY_ADVICE="为了安全起见，请先提交您的修改，然后再运行此脚本。"
MSG_GIT_CLEAN="✅ 本地Git状态干净，准备开始更新。"

# --- Steps ---
MSG_STEP1_CLONE="\n${C_BLUE}第一步: 正在从 GitHub 克隆最新的 Frosti 仓库...${C_NC}"
ERR_STEP1_CLONE_FAILED="❌ 克隆失败，请检查您的网络连接或 Git 配置。"
MSG_STEP1_CLONE_SUCCESS="✅ 最新代码克隆成功！"

MSG_STEP2_RSYNC="\n${C_BLUE}第二步: 正在安全地更新您的项目文件 (仅添加和覆盖)...${C_NC}"
ERR_STEP2_RSYNC_FAILED="❌ 文件更新失败。"
MSG_STEP2_RSYNC_SUCCESS="✅ 文件更新完成！"

MSG_STEP3_DELETE="\n${C_BLUE}第三步: 正在智能删除官方已移除的文件 (不会影响您忽略的文件)...${C_NC}"
MSG_STEP3_DELETING_DRY_RUN="正在进行干预式删除..."
MSG_STEP3_DELETING_EMPTY_DIR="删除空目录:"
MSG_STEP3_SKIPPING_NON_EMPTY_DIR="跳过非空目录:"
MSG_STEP3_DELETING_FILE="删除文件:"
MSG_STEP3_DELETE_SUCCESS="✅ 已废弃文件清理完成。"

MSG_STEP4_CLEAN_EMPTY="\n${C_BLUE}第四步: 正在清理所有残留的空文件夹...${C_NC}"
MSG_STEP4_CLEAN_EMPTY_SUCCESS="✅ 空文件夹清理完毕！"

MSG_STEP5_CLEAN_TEMP="\n${C_BLUE}第五步: 正在清理临时文件...${C_NC}"
MSG_STEP5_CLEAN_TEMP_SUCCESS="✅ 清理完毕！"

MSG_STEP6_PNPM="\n${C_BLUE}第六步: 正在使用 pnpm 安装/更新依赖...${C_NC}"
WARN_PNPM_NOT_FOUND="⚠️  警告: 未找到 pnpm 命令，请手动安装依赖。"
WARN_PNPM_GUIDE="您可以运行: npm install -g pnpm && pnpm install"
ERR_PNPM_INSTALL_FAILED="❌ 依赖安装失败，请手动运行 'pnpm install' 检查问题。"
MSG_PNPM_INSTALL_SUCCESS="✅ 依赖安装完成！"

# --- Final ---
MSG_FINAL_SUCCESS="\n${C_GREEN}🎉 更新流程全部完成！${C_NC}"
MSG_FINAL_ADVICE="现在您可以启动项目，检查更新后的效果了。"