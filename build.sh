#!/usr/bin/env bash
set -e

# ANSI Colors: Minimal Cyber Emerald & Teal Green
YELLOW='\033[1;33m'
YELLOW_BG='\033[43;30;1m'
TEAL='\033[38;2;20;184;166m'
NEON_GREEN='\033[38;2;74;222;128m'
CYAN='\033[38;2;45;212;191m'
ROSE='\033[38;2;251;113;133m'
BOLD='\033[1m'
RESET='\033[0m'

echo -e "${TEAL}"
cat << "EOF"
  ██████╗ ██╗████████╗   ██╗██╗██╗   ██╗███████╗██████╗ 
 ██╔════╝ ██║╚══██╔══╝   ██║██║██║   ██║██╔════╝██╔══██╗
 ██║  ███╗██║   ██║      ██║██║██║   ██║█████╗  ██████╔╝
 ██║   ██║██║   ██║      ██║██║██║   ██║██╔══╝  ██╔══██╗
 ╚██████╔╝██║   ██║      ╚██████╔╝    ███████╗██║  ██║
EOF
echo -e "${RESET}"
echo -e "${YELLOW_BG} ⚡ GIT WORKSPACE EXPLORER BUILD & VERIFICATION PIPELINE ⚡ ${RESET}\n"

# 1. Frontend Checks & Linting
echo -e "${CYAN}[1/4] 📦 Running Frontend Typechecks & Linters...${RESET}"
cd frontend
npm install --silent
if npm run lint; then
  echo -e "${NEON_GREEN}✔ Frontend checks passed!${RESET}\n"
else
  echo -e "${ROSE}✘ Frontend checks failed! Build halted.${RESET}"
  exit 1
fi
cd ..

# 2. Go Vet (Linter)
echo -e "${CYAN}[2/4] 🔍 Running Go Vet (Linter)...${RESET}"
if go vet ./...; then
  echo -e "${NEON_GREEN}✔ Go linter checks passed!${RESET}\n"
else
  echo -e "${ROSE}✘ Go vet checks failed! Build halted.${RESET}"
  exit 1
fi

# 3. Go Testing
echo -e "${CYAN}[3/4] 🧪 Running Backend Unit Tests...${RESET}"
if go test -v ./...; then
  echo -e "${NEON_GREEN}✔ Go unit tests passed!${RESET}\n"
else
  echo -e "${ROSE}✘ Go unit tests failed! Build halted.${RESET}"
  exit 1
fi

# 4. Compiling Build
echo -e "${CYAN}[4/4] ⚙️ Compiling Go Backend Executable...${RESET}"
mkdir -p bin
go build -ldflags="-s -w" -o bin/git-workspace-explorer .
echo -e "${NEON_GREEN}✔ Go binary generated: ./bin/git-workspace-explorer${RESET}\n"

# Frontend Production Assets Compile
echo -e "${CYAN}📦 Building React production bundle...${RESET}"
cd frontend
npm run build
cd ..
echo -e "${NEON_GREEN}✔ React build compiled!${RESET}\n"

echo -e "${YELLOW_BG} 🎉 PIPELINE PASSED: BUILD COMPLETE & READY FOR LAUNCH 🎉 ${RESET}\n"
