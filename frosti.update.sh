#!/bin/bash

# --- Configuration ---
UPSTREAM_REPO="https://github.com/EveSunMaple/Frosti.git"
TEMP_DIR="frosti_temp_update"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$SCRIPT_DIR/src/i18n"

# --- Colors ---
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_BLUE='\033[0;34m'
C_NC='\033[0m' # No Color

# --- Language Setup ---
# Default to English
lang="en" 
# Detect language from system settings (e.g., zh_CN.UTF-8 -> zh)
if [[ "$LANG" == "zh"* ]]; then
  lang="zh"
fi
# Allow user to override language with a command-line argument (e.g., ./frosti.update.sh en)
if [[ -n "$1" ]]; then
  # Check if the language file exists for the given argument
  if [[ -f "$I18N_DIR/$1.sh" ]]; then
    lang="$1"
  else
    echo -e "${C_YELLOW}Warning: Language '$1' not found. Falling back to '$lang'.${C_NC}" >&2
  fi
fi

# Source the language file
if [[ -f "$I18N_DIR/$lang.sh" ]]; then
  source "$I18N_DIR/$lang.sh"
else
  echo -e "${C_RED}Error: Language file '$I18N_DIR/$lang.sh' not found. Exiting.${C_NC}" >&2
  exit 1
fi

# --- Main Script ---
echo -e "${C_BLUE}=========================================${C_NC}"
echo -e "${C_BLUE}      ${MSG_HEADER_TITLE}      ${C_NC}"
echo -e "${C_BLUE}=========================================${C_NC}"

echo -e "${C_YELLOW}${MSG_WARNING_TITLE}${C_NC}"
echo "${MSG_WARNING_RECOMMENDATION}"
echo "${MSG_WARNING_IGNORE}"
echo ""
read -p "$(echo -e "${PROMPT_CONTINUE}")" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${MSG_CANCELLED}"
    exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo -e "${C_RED}${ERR_GIT_DIRTY}${C_NC}"
  echo "${ERR_GIT_DIRTY_ADVICE}"
  exit 1
fi
echo -e "${C_GREEN}${MSG_GIT_CLEAN}${C_NC}"

echo -e "${MSG_STEP1_CLONE}"
rm -rf "$TEMP_DIR"
git clone --depth 1 "$UPSTREAM_REPO" "$TEMP_DIR"
if [[ $? -ne 0 ]]; then
  echo -e "${C_RED}${ERR_STEP1_CLONE_FAILED}${C_NC}"
  exit 1
fi
echo -e "${C_GREEN}${MSG_STEP1_CLONE_SUCCESS}${C_NC}"

echo -e "${MSG_STEP2_RSYNC}"
rsync -av --exclude-from='.updateignore' "$TEMP_DIR/" .
if [[ $? -ne 0 ]]; then
  echo -e "${C_RED}${ERR_STEP2_RSYNC_FAILED}${C_NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi
echo -e "${C_GREEN}${MSG_STEP2_RSYNC_SUCCESS}${C_NC}"

echo -e "${MSG_STEP3_DELETE}"
echo "${MSG_STEP3_DELETING_DRY_RUN}"
# Use rsync's dry-run output to find files that would be deleted
rsync -avn --delete --exclude-from='.updateignore' "$TEMP_DIR/" . | grep 'deleting ' | while read -r line ; do
    file_to_delete=$(echo "$line" | sed 's/deleting //')
    if [[ -d "$file_to_delete" ]]; then
        # Check if directory is empty
        if [[ -z "$(ls -A "$file_to_delete")" ]]; then
            echo "${MSG_STEP3_DELETING_EMPTY_DIR} $file_to_delete"
            rm -r "$file_to_delete"
        else
            echo "${MSG_STEP3_SKIPPING_NON_EMPTY_DIR} $file_to_delete"
        fi
    else
        echo "${MSG_STEP3_DELETING_FILE} $file_to_delete"
        rm -f "$file_to_delete"
    fi
done
echo -e "${C_GREEN}${MSG_STEP3_DELETE_SUCCESS}${C_NC}"

echo -e "${MSG_STEP4_CLEAN_EMPTY}"
find . -type d -empty -delete
echo -e "${C_GREEN}${MSG_STEP4_CLEAN_EMPTY_SUCCESS}${C_NC}"

echo -e "${MSG_STEP5_CLEAN_TEMP}"
rm -rf "$TEMP_DIR"
echo -e "${C_GREEN}${MSG_STEP5_CLEAN_TEMP_SUCCESS}${C_NC}"

echo -e "${MSG_STEP6_PNPM}"
if ! command -v pnpm &> /dev/null; then
    echo -e "${C_YELLOW}${WARN_PNPM_NOT_FOUND}${C_NC}"
    echo "${WARN_PNPM_GUIDE}"
else
    pnpm install
    if [[ $? -ne 0 ]]; then
      echo -e "${C_RED}${ERR_PNPM_INSTALL_FAILED}${C_NC}"
      exit 1
    fi
    echo -e "${C_GREEN}${MSG_PNPM_INSTALL_SUCCESS}${C_NC}"
fi

echo -e "${MSG_FINAL_SUCCESS}"
echo "${MSG_FINAL_ADVICE}"

exit 0