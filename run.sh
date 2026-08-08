#!/usr/bin/env bash
set -e

PORT="${PORT:-8080}"
WORKSPACE_DIR="${WORKSPACE_DIR:-/Users/deepak/Projects}"

# ANSI Colors: Minimal Cyber Emerald & Teal Green
YELLOW='\033[1;33m'
YELLOW_BG='\033[43;30;1m'
TEAL='\033[38;2;20;184;166m'
NEON_GREEN='\033[38;2;74;222;128m'
CYAN='\033[38;2;45;212;191m'
BOLD='\033[1m'
RESET='\033[0m'

echo -e "${TEAL}"
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

if [[ "$1" == "--dev" || "$1" == "-d" || "$DEV" == "true" ]]; then
  echo -e "${YELLOW_BG} ⚡ STARTING IN DEVELOPMENT MODE (HOT RELOAD / HMR) ⚡ ${RESET}\n"
  echo -e "${NEON_GREEN}📁 Workspace Path :${RESET} ${BOLD}$WORKSPACE_DIR${RESET}"
  echo -e "${NEON_GREEN}⚙️ Backend API     :${RESET} ${YELLOW}http://localhost:8080${RESET}"
  echo -e "${NEON_GREEN}🔥 Frontend HMR    :${RESET} ${CYAN}http://localhost:3000${RESET} (Vite Dev Server)"
  echo -e "───────────────────────────────────────────────────────────────────\n"

  cleanup() {
    echo -e "\n${YELLOW}Stopping backend and frontend dev servers...${RESET}"
    kill 0 2>/dev/null || true
  }
  trap cleanup EXIT INT TERM

  # Start Go backend server in background
  echo -e "${YELLOW}Starting Go backend server...${RESET}"
  WORKSPACE_DIR="$WORKSPACE_DIR" PORT="8080" go run main.go &
  
  sleep 1

  # Start Vite frontend dev server with Hot Reloading
  echo -e "${YELLOW}Starting Vite React dev server...${RESET}"
  cd frontend && npm run dev
  exit 0
fi

echo -e "${YELLOW_BG} 🚀 SERVER LAUNCHING (PRODUCTION MODE) 🚀 ${RESET}"
echo -e "${NEON_GREEN}📁 Workspace Path :${RESET} ${BOLD}$WORKSPACE_DIR${RESET}"
echo -e "${NEON_GREEN}🌐 Local URL       :${RESET} ${YELLOW}http://localhost:$PORT${RESET}"
echo -e "${NEON_GREEN}⚡ Engine          :${RESET} Go + React"
echo -e "───────────────────────────────────────────────────────────────────\n"

if [ -f "./bin/git-workspace-explorer" ]; then
  WORKSPACE_DIR="$WORKSPACE_DIR" PORT="$PORT" ./bin/git-workspace-explorer
elif [ -f "./server" ]; then
  WORKSPACE_DIR="$WORKSPACE_DIR" PORT="$PORT" ./server
else
  echo -e "${YELLOW}⚙️ Executable binary not found. Launching via 'go run main.go'...${RESET}"
  WORKSPACE_DIR="$WORKSPACE_DIR" PORT="$PORT" go run main.go
fi
