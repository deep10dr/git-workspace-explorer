#!/usr/bin/env bash
set -e

PORT="${PORT:-8080}"
WORKSPACE_DIR="${WORKSPACE_DIR:-/Users/deepak/Projects}"

# ANSI Colors: Yellow & Black + Cyber Green
YELLOW='\033[1;33m'
YELLOW_BG='\033[43;30;1m'
NEON_GREEN='\033[1;92m'
CYAN='\033[1;36m'
BOLD='\033[1m'
RESET='\033[0m'

echo -e "${YELLOW}"
cat << "EOF"
 ╔═══════════════════════════════════════════════════════════════════╗
 ║   ██████╗ ██╗████████╗   ██╗██╗██╗   ██╗███████╗██████╗         ║
 ║  ██╔════╝ ██║╚══██╔══╝   ██║██║██║   ██║██╔════╝██╔══██╗        ║
 ║  ██║  ███╗██║   ██║      ██║██║██║   ██║█████╗  ██████╔╝        ║
 ║  ██║   ██║██║   ██║      ██║██║██║   ██║██╔══╝  ██╔══██╗        ║
 ║  ╚██████╔╝██║   ██║      ╚██████╔╝    ███████╗██║  ██║          ║
 ╚═══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${RESET}"

echo -e "${YELLOW_BG} 🚀 SERVER LAUNCHING 🚀 ${RESET}"
echo -e "${NEON_GREEN}📁 Workspace Path :${RESET} ${BOLD}$WORKSPACE_DIR${RESET}"
echo -e "${NEON_GREEN}🌐 Local URL       :${RESET} ${YELLOW}http://localhost:$PORT${RESET}"
echo -e "${NEON_GREEN}⚡ Engine          :${RESET} Go + React + SQLite Indexer"
echo -e "───────────────────────────────────────────────────────────────────\n"

if [ -f "./bin/git-workspace-explorer" ]; then
  WORKSPACE_DIR="$WORKSPACE_DIR" PORT="$PORT" ./bin/git-workspace-explorer
elif [ -f "./server" ]; then
  WORKSPACE_DIR="$WORKSPACE_DIR" PORT="$PORT" ./server
else
  echo -e "${YELLOW}⚙️ Executable binary not found. Launching via 'go run main.go'...${RESET}"
  WORKSPACE_DIR="$WORKSPACE_DIR" PORT="$PORT" go run main.go
fi
