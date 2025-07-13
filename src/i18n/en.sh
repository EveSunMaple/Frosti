#!/bin/bash
# English Language File for Frosti Updater

# --- Header ---
MSG_HEADER_TITLE="Frosti Project Update Assistant"

# --- Warnings and Prompts ---
MSG_WARNING_TITLE="⚠️  Warning: This script will fetch the latest files from the official repository and overwrite your local files."
MSG_WARNING_RECOMMENDATION="We recommend backing up your project before updating, or ensuring all changes are committed to Git."
MSG_WARNING_IGNORE="This script will protect your core content based on the \`.updateignore\` file."
PROMPT_CONTINUE="Do you understand the risks and wish to continue? (y/N): "
MSG_CANCELLED="Operation cancelled."

# --- Git Status ---
ERR_GIT_DIRTY="❌ Error: You have uncommitted local changes."
ERR_GIT_DIRTY_ADVICE="For safety, please commit your changes before running this script."
MSG_GIT_CLEAN="✅ Local Git status is clean, ready to start the update."

# --- Steps ---
MSG_STEP1_CLONE="\n${C_BLUE}Step 1: Cloning the latest Frosti repository from GitHub...${C_NC}"
ERR_STEP1_CLONE_FAILED="❌ Clone failed. Please check your network connection or Git configuration."
MSG_STEP1_CLONE_SUCCESS="✅ Latest code cloned successfully!"

MSG_STEP2_RSYNC="\n${C_BLUE}Step 2: Safely updating your project files (add and overwrite only)...${C_NC}"
ERR_STEP2_RSYNC_FAILED="❌ File update failed."
MSG_STEP2_RSYNC_SUCCESS="✅ File update complete!"

MSG_STEP3_DELETE="\n${C_BLUE}Step 3: Intelligently deleting files removed from the official repo (won't affect your ignored files)...${C_NC}"
MSG_STEP3_DELETING_DRY_RUN="Performing interactive deletion..."
MSG_STEP3_DELETING_EMPTY_DIR="Deleting empty directory:"
MSG_STEP3_SKIPPING_NON_EMPTY_DIR="Skipping non-empty directory:"
MSG_STEP3_DELETING_FILE="Deleting file:"
MSG_STEP3_DELETE_SUCCESS="✅ Obsolete file cleanup complete."

MSG_STEP4_CLEAN_EMPTY="\n${C_BLUE}Step 4: Cleaning up all remaining empty folders...${C_NC}"
MSG_STEP4_CLEAN_EMPTY_SUCCESS="✅ Empty folder cleanup complete!"

MSG_STEP5_CLEAN_TEMP="\n${C_BLUE}Step 5: Cleaning up temporary files...${C_NC}"
MSG_STEP5_CLEAN_TEMP_SUCCESS="✅ Cleanup complete!"

MSG_STEP6_PNPM="\n${C_BLUE}Step 6: Installing/updating dependencies with pnpm...${C_NC}"
WARN_PNPM_NOT_FOUND="⚠️  Warning: 'pnpm' command not found. Please install dependencies manually."
WARN_PNPM_GUIDE="You can run: npm install -g pnpm && pnpm install"
ERR_PNPM_INSTALL_FAILED="❌ Dependency installation failed. Please run 'pnpm install' manually to check for issues."
MSG_PNPM_INSTALL_SUCCESS="✅ Dependency installation complete!"

# --- Final ---
MSG_FINAL_SUCCESS="\n${C_GREEN}🎉 Update process fully completed!${C_NC}"
MSG_FINAL_ADVICE="You can now start your project and check the updated results."