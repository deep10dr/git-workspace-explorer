#!/usr/bin/env bash
set -e

# Color definitions
YELLOW='\033[1;33m'
YELLOW_BG='\033[43;30;1m'
NEON_GREEN='\033[1;92m'
CYAN='\033[1;36m'
RED='\033[1;31m'
BOLD='\033[1m'
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
echo -e "${YELLOW_BG} ⚡ GIT WORKSPACE EXPLORER BUILD & VERIFICATION PIPELINE ⚡ ${RESET}\n"

# 1. Frontend Checks & Linting
echo -e "${YELLOW}[1/4] 📦 Running Frontend Typechecks & Linters...${RESET}"
cd frontend
npm install --silent
if npm run lint; then
  echo -e "${NEON_GREEN}✔ Frontend checks passed!${RESET}\n"
else
  echo -e "${RED}✘ Frontend checks failed! Build halted.${RESET}"
  exit 1
fi
cd ..

# 2. Go Vet (Linter)
echo -e "${YELLOW}[2/4] 🔍 Running Go Vet (Linter)...${RESET}"
if go vet ./...; then
  echo -e "${NEON_GREEN}✔ Go linter checks passed!${RESET}\n"
else
  echo -e "${RED}✘ Go vet checks failed! Build halted.${RESET}"
  exit 1
fi

# 3. Go Testing
echo -e "${YELLOW}[3/4] 🧪 Running Backend Unit Tests...${RESET}"
if go test -v ./...; then
  echo -e "${NEON_GREEN}✔ Go unit tests passed!${RESET}\n"
else
  echo -e "${RED}✘ Go unit tests failed! Build halted.${RESET}"
  exit 1
fi

# 4. Compiling Build
echo -e "${YELLOW}[4/4] ⚙️ Compiling Go Backend Executable...${RESET}"
mkdir -p bin
go build -ldflags="-s -w" -o bin/git-workspace-explorer .
echo -e "${NEON_GREEN}✔ Go binary generated: ./bin/git-workspace-explorer${RESET}\n"

# Frontend Production Assets Compile
echo -e "${YELLOW}📦 Building React production bundle...${RESET}"
cd frontend
npm run build
cd ..
echo -e "${NEON_GREEN}✔ React build compiled!${RESET}\n"

echo -e "${YELLOW_BG} 🎉 PIPELINE PASSED: BUILD COMPLETE & READY FOR LAUNCH 🎉 ${RESET}\n"
