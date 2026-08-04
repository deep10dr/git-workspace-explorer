# Git Workspace Explorer 🚀

> **The ultimate lightweight, open-source desktop explorer and health dashboard for all your local Git repositories.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Go](https://img.shields.io/badge/Backend-Go-00ADD8?logo=go&logoColor=white)](https://go.dev/)

---

## 💡 Overview & Vision

Developers often manage dozens or even hundreds of local Git repositories across various project directories. Keeping track of active branches, uncommitted changes, forgotten stashes, detached HEAD states, and unpushed commits across all these repos using traditional tools is fragmented and tedious.

**Git Workspace Explorer** provides a **single pane of glass** to instantly discover, search, monitor, and manage your entire local Git ecosystem. 

🔥 **Docker-First & Zero Setup:** Run as a lightweight containerized web application. Simply mount your workspace folder and open `http://localhost:8080` in any browser!

---

## 🔴 The Problem

* **Repository Sprawl:** Managing 20–200 local repositories scattered across projects.
* **Hidden Work:** Uncommitted changes, forgotten stashes, and local commits never pushed.
* **Context Switching:** Toggling between VS Code, GitKraken, terminal, and browser tabs to check repository statuses.
* **Operational Blindspots:** Undetected merge conflicts, rebase locks, detached HEADs, and stale feature branches clogging local disk space.

---

## ✨ Key Features

### 🔍 Workspace Auto-Scanner
* **Zero Manual Imports:** Drop or select one or more root workspace folders (e.g. `~/Projects`).
* **Instant Discovery:** Automatically scans directory trees and registers every Git repository.
* **Live Folder Watcher:** Auto-refreshes when repositories or branches are created, deleted, or altered.

---

### 📊 Repository Dashboard & Health Audit
* **Unified Workspace View:** Overview cards for every local repository.
* **Real-time Status Badges:** Dirty working tree, unpushed/unpulled commits, stash count, current branch.
* **Automated Repository Health Diagnostics:**
  * ⚠️ Rebase / Merge / Cherry-pick operations in progress
  * ⚠️ Detached HEAD states
  * ⚠️ Stale branches (no activity for X months)
  * ⚠️ Unpushed local commits & old unmerged stashes
  * ⚠️ Oversized repository directory warnings

---

### 🌿 Branch Explorer
* **Complete Branch Tree:** Visual breakdown of local and remote branches.
* **Ahead/Behind Tracking:** Real-time push/pull counters relative to default remotes.
* **Quick Checkout History:** Track when branches were last checked out or merged.
* **Filter & Search:** Fuzzy-search branch names across single or multiple repositories.

---

### 📜 Commit Explorer & Graph
* **Interactive Commit Graph:** Clear visual representation of branches, merges, tags, and HEAD.
* **Diff Viewer:** Integrated side-by-side or inline diff for changed files per commit.
* **Commit History Search:** Search by commit message, author, SHA, or modified file paths.

---

### 📦 Stash Explorer & Supercharger
* **Cross-Repo Stash Overview:** Never lose stashed work again.
* **Stash File Inspection:** View changed files and diffs stored inside any stash.
* **Enhanced Stash Metadata:**
  * ⭐ **Favorite Stashes** to keep track of critical context.
  * 🏷️ **Tags & Personal Notes** for stash organization.
  * 🔍 **Stash Comparison & Search** across all repos.

---

### 📂 Working Tree & Quick Diffs
* **File Change Breakdown:** Clearly categorizes modified, added, deleted, renamed, untracked, and ignored files.
* **Instant Diffs:** Click any file to immediately inspect live working tree diffs.

---

### ⚡ Global Cross-Repository Search
* **Unified Search Bar:** Search query matches across **Repositories**, **Branches**, **Commits**, **Stashes**, and **Files** across all registered workspaces.
* **Instant Filtering:** Jump straight to the repo, stash, or commit from search results.

---

### 📈 Workspace Analytics & Insights
* **Workspace Overview:** Aggregate statistics (Total repos, active branches, total stashes, unpushed commits).
* **Storage Insights:** Identify largest `.git` directories and repositories needing garbage collection (`git gc`).
* **Activity Timeline:** Global chronological stream of local git events (commits, branch checkouts, stash creation).

## 📁 Project Directory Structure

```
git-workspace-explorer/
├── Dockerfile                    # Multi-stage Docker build config
├── docker-compose.yml            # Docker Compose orchestration
├── README.md                     # Project documentation
├── go.mod                        # Go module definition
├── main.go                       # Web server entry point & static file handler
├── pkg/
│   ├── scanner/                  # Multi-threaded repository auto-scanner
│   ├── gitengine/                # Git commit, branch, stash & diff inspector
│   ├── health/                   # Repository health diagnostics engine
│   ├── indexer/                  # Fast SQLite search indexer
│   └── api/                      # REST & WebSocket API handlers
└── frontend/
    ├── package.json              # Frontend dependencies
    ├── vite.config.ts            # Vite configuration
    ├── index.html                # HTML entry template
    └── src/
        ├── App.tsx               # Main application component
        ├── index.css             # Design system & dark glassmorphism styles
        ├── components/           # UI Components (Dashboard, Branches, Stashes, Diffs, Search)
        ├── types/                # TypeScript interfaces & types
        └── services/             # API client & WebSocket listener
```

---

## 🛠 Tech Stack & Architecture

Git Workspace Explorer is engineered to be **extremely lightweight**, **fast**, and **privacy-focused (100% offline-first)**.

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Container Engine** | [Docker](https://www.docker.com/) / Docker Compose | Single-command deployment; zero system setup required on host machine |
| **Backend Engine** | [Go](https://go.dev/) | High-performance multithreaded directory scanning & concurrent Git operations |
| **Frontend UI** | [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) | Responsive, modern component library with type-safe state management |
| **Styling** | Vanilla CSS / Tailwind CSS | Modern aesthetics, glassmorphism UI, smooth dark mode theme |
| **Index Database** | [SQLite](https://sqlite.org/) | Embedded fast local indexing for instant cross-repository search |
| **Git Engine** | `go-git` + Native `git` CLI fallback | Fast in-memory parsing with fallback to local Git binary for edge cases |

---

## ⚡ Convenience CLI Scripts

For quick local management without needing to remember complex parameters, use the included shell scripts:

```bash
# 1. Rebuild frontend & Go binary
./build.sh

# 2. Run the compiled application
./run.sh

# 3. Rebuild and launch server in one command
./run_and_build.sh
```

---

## 🚀 Getting Started with Docker

### ⚡ Quick Start (Docker Run)

Run Git Workspace Explorer with a single command by mounting your local project workspace:

```bash
docker run -d \
  --name git-workspace-explorer \
  -p 8080:8080 \
  -v /Users/deepak/Projects:/workspaces:ro \
  git-workspace-explorer:latest
```

Open `http://localhost:8080` in your browser!

---

### 🐳 Docker Compose

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/git-workspace-explorer.git
   cd git-workspace-explorer
   ```

2. **Configure your workspace path in `docker-compose.yml`:**
   ```yaml
   version: '3.8'
   services:
     git-explorer:
       build: .
       ports:
         - "8080:8080"
       volumes:
         - /Users/deepak/Projects:/workspaces:ro
   ```

3. **Launch the container:**
   ```bash
   docker compose up -d
   ```

---

### 💻 Local Development (Without Docker)

1. **Clone & install dependencies:**
   ```bash
   git clone https://github.com/your-username/git-workspace-explorer.git
   cd git-workspace-explorer
   ```

2. **Run backend & frontend:**
   ```bash
   # Backend
   go run main.go

   # Frontend (in another terminal)
   cd frontend && npm install && npm run dev
   ```

---

## 🗺 Roadmap & Long-Term Vision

- [ ] **Phase 1: Core Engine & Explorer**
  - [x] Workspace Scanner & Repository Discovery
  - [ ] Dashboard & Repository Health Diagnostics
  - [ ] Branch, Commit & Working Tree Viewers
  - [ ] Stash Explorer & Diff Inspector
- [ ] **Phase 2: Global Indexing & Search**
  - [ ] Embedded SQLite Indexer for fast search across 100+ repos
  - [ ] Global search interface (Search commits, branches, stashes, repos)
- [ ] **Phase 3: Advanced Workspace Tooling**
  - [ ] Stash tagging, favoriting & notes system
  - [ ] Workspace analytics & storage optimizer (`git gc` triggers, stale branch prune suggestions)
  - [ ] Interactive activity timeline
- [ ] **Phase 4: Ecosystem & Extensions**
  - [ ] GitHub / GitLab / Bitbucket remote PR & issue status indicators
  - [ ] Built-in embedded terminal tab
  - [ ] AI-assisted commit message generator & repository summary assistant

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
