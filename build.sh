#!/usr/bin/env bash
set -e

# Color definitions (Yellow & Black / Cyber Green)
YELLOW='\033[1;33m'
YELLOW_BG='\033[43;30;1m'
NEON_GREEN='\033[1;92m'
CYAN='\033[1;36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

echo -e "${YELLOW}"
cat << "EOF"
  ██████╗ ██╗████████╗   ██╗██╗██╗   ██╗███████╗██████╗ 
 ██╔════╝ ██║╚══██╔══╝   ██║██║██║   ██║██╔════╝██╔══██╗
 ██║  ███╗██║   ██║      ██║██║██║   ██║█████╗  ██████╔╝
 ██║   ██║██║   ██║      ██║██║██║   ██║██╔══╝  ██╔══██╗
 ╚██████╔╝██║   ██║      ╚██████╔╝    ███████╗██║  ██║
EOF
echo -e "${RESET}"
echo -e "${YELLOW_BG} ⚡ GIT WORKSPACE EXPLORER BUILD SYSTEM ⚡ ${RESET}\n"

echo -e "${YELLOW}[1/2] 📦 Building React Frontend (TypeScript + Vite)...${RESET}"
cd frontend
npm install --silent
npm run build
cd ..
echo -e "${NEON_GREEN}✔ Frontend production assets compiled successfully!${RESET}\n"

echo -e "${YELLOW}[2/2] ⚙️ Compiling Go Backend Executable...${RESET}"
mkdir -p bin
go build -ldflags="-s -w" -o bin/git-workspace-explorer .
echo -e "${NEON_GREEN}✔ Go binary generated: ./bin/git-workspace-explorer${RESET}\n"

echo -e "${YELLOW_BG} 🎉 BUILD COMPLETE & READY FOR LAUNCH 🎉 ${RESET}\n"
