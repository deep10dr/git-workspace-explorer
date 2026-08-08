package api

import (
	"encoding/json"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"

	"git-workspace-explorer/pkg/gitengine"
	"git-workspace-explorer/pkg/health"
	"git-workspace-explorer/pkg/indexer"
	"git-workspace-explorer/pkg/scanner"
)

type Server struct {
	mu           sync.RWMutex
	index        *indexer.MemoryIndex
	workspaceDir string
	repos        map[string]*gitengine.Repository
	repoPaths    map[string]string
}

func NewServer(workspaceDir string) *Server {
	if workspaceDir == "" {
		workspaceDir = "/workspaces"
	}
	s := &Server{
		index:        indexer.NewIndex(),
		workspaceDir: workspaceDir,
		repos:        make(map[string]*gitengine.Repository),
		repoPaths:    make(map[string]string),
	}
	s.RefreshWorkspace()
	return s
}

func (s *Server) RefreshWorkspace() {
	s.mu.Lock()
	defer s.mu.Unlock()

	paths, err := scanner.DiscoverRepositories([]string{s.workspaceDir})
	if err != nil {
		paths = []string{}
	}

	// Also check if current directory or subdirectories exist
	if len(paths) == 0 {
		pwd, _ := os.Getwd()
		paths, _ = scanner.DiscoverRepositories([]string{pwd})
	}

	s.repos = make(map[string]*gitengine.Repository)
	s.repoPaths = make(map[string]string)

	for _, path := range paths {
		repo, err := gitengine.GetRepositoryDetails(path)
		if err != nil {
			continue
		}

		branches, _ := gitengine.GetBranches(path)
		stashes, _ := gitengine.GetStashes(path)
		commits, _ := gitengine.GetCommits(path, 30)

		repo.Health = health.EvaluateHealth(repo, branches, stashes)

		s.repos[repo.ID] = repo
		s.repoPaths[repo.ID] = path
		s.index.StoreRepository(repo, branches, stashes, commits)
	}
}

type ToolInfo struct {
	Name         string `json:"name"`
	Category     string `json:"category"`
	Language     string `json:"language"`
	IsInstalled  bool   `json:"isInstalled"`
	InstallCmd   string `json:"installCmd"`
	SizeEstimate string `json:"sizeEstimate"`
	Description  string `json:"description"`
}

func (s *Server) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/overview", s.handleOverview)
	mux.HandleFunc("/api/workspace/overview", s.handleOverview)
	mux.HandleFunc("/api/repositories", s.handleRepositories)
	mux.HandleFunc("/api/repositories/", s.handleRepositoryDetail)
	mux.HandleFunc("/api/search", s.handleSearch)
	mux.HandleFunc("/api/scan", s.handleScan)
	mux.HandleFunc("/api/tools", s.handleTools)
}

func (s *Server) handleTools(w http.ResponseWriter, r *http.Request) {
	tools := []ToolInfo{
		{
			Name:         "golangci-lint",
			Category:     "Linter",
			Language:     "Go",
			IsInstalled:  toolInstalled("golangci-lint"),
			InstallCmd:   "brew install golangci-lint",
			SizeEstimate: "~40–50 MB",
			Description:  "Fast Go linter aggregator running staticcheck, errcheck, and govets.",
		},
		{
			Name:         "gofmt",
			Category:     "Formatter",
			Language:     "Go",
			IsInstalled:  toolInstalled("gofmt"),
			InstallCmd:   "Built into Go (no separate install)",
			SizeEstimate: "0 MB (included)",
			Description:  "Official Go source code formatter.",
		},
		{
			Name:         "pytest",
			Category:     "Testing",
			Language:     "Python",
			IsInstalled:  toolInstalled("pytest"),
			InstallCmd:   "pip install pytest",
			SizeEstimate: "~5 MB",
			Description:  "Full-featured Python testing framework.",
		},
		{
			Name:         "mypy",
			Category:     "Type Checking",
			Language:     "Python",
			IsInstalled:  toolInstalled("mypy"),
			InstallCmd:   "pip install mypy",
			SizeEstimate: "~15–20 MB",
			Description:  "Optional static type checker for Python.",
		},
		{
			Name:         "ruff",
			Category:     "Linter",
			Language:     "Python",
			IsInstalled:  toolInstalled("ruff"),
			InstallCmd:   "pip install ruff",
			SizeEstimate: "~10 MB",
			Description:  "Extremely fast Python linter written in Rust.",
		},
		{
			Name:         "prettier",
			Category:     "Formatter",
			Language:     "JS/TS/JSON/YAML",
			IsInstalled:  toolInstalled("prettier"),
			InstallCmd:   "npm install --save-dev prettier",
			SizeEstimate: "~15–20 MB",
			Description:  "Opinionated code formatter for JavaScript, TypeScript, JSON, and YAML.",
		},
		{
			Name:         "gitleaks",
			Category:     "Secret Scanning",
			Language:     "Global / YAML / Config",
			IsInstalled:  toolInstalled("gitleaks"),
			InstallCmd:   "brew install gitleaks",
			SizeEstimate: "~10–15 MB",
			Description:  "Detects hardcoded secrets, API keys, and tokens in repositories.",
		},
		{
			Name:         "trufflehog",
			Category:     "Secret Scanning",
			Language:     "Global / YAML / Config",
			IsInstalled:  toolInstalled("trufflehog"),
			InstallCmd:   "brew install trufflehog",
			SizeEstimate: "~30–40 MB",
			Description:  "High-entropy secret scanner for credentials in git commits.",
		},
	}

	jsonResponse(w, tools)
}

func toolInstalled(name string) bool {
	_, err := exec.LookPath(name)
	return err == nil
}

func (s *Server) handleOverview(w http.ResponseWriter, r *http.Request) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	overview := gitengine.WorkspaceOverview{}

	for _, repo := range s.repos {
		overview.TotalRepositories++
		if repo.Status.IsClean {
			overview.CleanRepositories++
		} else {
			overview.DirtyRepositories++
		}
		overview.TotalStashes += repo.StashCount
		overview.UnpushedCommits += repo.AheadCount

		if repo.Health.Status != "healthy" {
			overview.WarningIssues++
		}
	}

	jsonResponse(w, overview)
}

func (s *Server) handleRepositories(w http.ResponseWriter, r *http.Request) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []*gitengine.Repository
	for _, repo := range s.repos {
		list = append(list, repo)
	}

	jsonResponse(w, list)
}

func (s *Server) handleRepositoryDetail(w http.ResponseWriter, r *http.Request) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	path := r.URL.Path
	parts := strings.Split(strings.Trim(path, "/"), "/")
	if len(parts) < 3 {
		http.Error(w, "Invalid route", http.StatusBadRequest)
		return
	}

	repoID := parts[2]
	repoPath, exists := s.repoPaths[repoID]
	if !exists {
		http.Error(w, "Repository not found", http.StatusNotFound)
		return
	}

	// Sub-resource routes
	if len(parts) >= 4 {
		subResource := parts[3]
		switch subResource {
		case "branches":
			branches, err := gitengine.GetBranches(repoPath)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			jsonResponse(w, branches)
			return

		case "commits":
			if len(parts) == 4 {
				commits, err := gitengine.GetCommits(repoPath, 50)
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				jsonResponse(w, commits)
				return
			} else if len(parts) >= 5 {
				commitSHA := parts[4]
				if len(parts) == 6 && parts[5] == "files" {
					files, err := gitengine.GetCommitFiles(repoPath, commitSHA)
					if err != nil {
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}
					jsonResponse(w, files)
					return
				} else if len(parts) == 6 && parts[5] == "diff" {
					filePath := r.URL.Query().Get("file")
					diffText, err := gitengine.GetCommitFileDiff(repoPath, commitSHA, filePath)
					if err != nil {
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}
					jsonResponse(w, map[string]string{"path": filePath, "diff": diffText})
					return
				} else if len(parts) == 6 && parts[5] == "verify" {
					results, err := s.verifyCommit(repoPath, commitSHA)
					if err != nil {
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}
					jsonResponse(w, results)
					return
				}
			}

		case "stashes":
			if len(parts) == 4 {
				stashes, err := gitengine.GetStashes(repoPath)
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				jsonResponse(w, stashes)
				return
			} else if len(parts) >= 6 && parts[5] == "diff" {
				stashRef := parts[4]
				filePath := r.URL.Query().Get("file")
				diffText, err := gitengine.GetStashFileDiff(repoPath, stashRef, filePath)
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				jsonResponse(w, map[string]string{"path": filePath, "diff": diffText})
				return
			}

		case "diff":
			filePath := r.URL.Query().Get("file")
			if filePath == "" {
				http.Error(w, "Missing file param", http.StatusBadRequest)
				return
			}
			diffText, err := gitengine.GetFileDiff(repoPath, filePath)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			jsonResponse(w, map[string]string{"path": filePath, "diff": diffText})
			return
		}
	}

	// Default: Single repo summary
	repo, exists := s.repos[repoID]
	if !exists {
		http.Error(w, "Repository not found", http.StatusNotFound)
		return
	}
	jsonResponse(w, repo)
}

func (s *Server) handleSearch(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	results := s.index.Search(q)
	jsonResponse(w, results)
}

func (s *Server) handleScan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload struct {
		Path string `json:"path"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err == nil && payload.Path != "" {
		s.workspaceDir = payload.Path
	}

	s.RefreshWorkspace()
	jsonResponse(w, map[string]string{"status": "scanned", "workspace": s.workspaceDir})
}

func jsonResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	json.NewEncoder(w).Encode(data)
}

func GetAbsPath(path string) string {
	abs, err := filepath.Abs(path)
	if err != nil {
		return path
	}
	return abs
}

type VerifyResult struct {
	Name    string `json:"name"`
	Status  string `json:"status"` // "success", "failure", "skipped"
	Message string `json:"message"`
	Output  string `json:"output"`
}

func (s *Server) verifyCommit(repoPath, sha string) ([]VerifyResult, error) {
	// 1. Get current branch/commit ref
	currBranchCmd := exec.Command("git", "rev-parse", "--abbrev-ref", "HEAD")
	currBranchCmd.Dir = repoPath
	origBranchBytes, err := currBranchCmd.Output()
	origBranch := strings.TrimSpace(string(origBranchBytes))
	if err != nil || origBranch == "" {
		origBranch = "main" // default
	}

	// 2. Check if working tree is dirty & checkout SHA if different from current branch
	statusCmd := exec.Command("git", "status", "--porcelain")
	statusCmd.Dir = repoPath
	statusOut, _ := statusCmd.Output()
	isDirty := len(strings.TrimSpace(string(statusOut))) > 0

	shouldCheckout := sha != "" && sha != "HEAD" && sha != origBranch

	if shouldCheckout {
		if isDirty {
			exec.Command("git", "stash", "--include-untracked").Run()
		}
		exec.Command("git", "checkout", sha).Run()
		defer func() {
			exec.Command("git", "checkout", origBranch).Run()
			if isDirty {
				exec.Command("git", "stash", "pop").Run()
			}
		}()
	}

	var results []VerifyResult

	// 5. Discover project types & run verification checks
	hasGo := fileExists(filepath.Join(repoPath, "go.mod"))
	hasNode := fileExists(filepath.Join(repoPath, "package.json"))

	if hasGo {
		// Go Vet linter check
		vetCmd := exec.Command("go", "vet", "./...")
		vetCmd.Dir = repoPath
		vetOut, vetErr := vetCmd.CombinedOutput()
		vetStatus := "success"
		if vetErr != nil {
			vetStatus = "failure"
		}
		results = append(results, VerifyResult{
			Name:    "Go Vet (Linter)",
			Status:  vetStatus,
			Message: "Static analysis of Go syntax and correctness",
			Output:  string(vetOut),
		})

		// Go Unit Tests check
		testCmd := exec.Command("go", "test", "./...")
		testCmd.Dir = repoPath
		testOut, testErr := testCmd.CombinedOutput()
		testStatus := "success"
		if testErr != nil {
			testStatus = "failure"
		}
		results = append(results, VerifyResult{
			Name:    "Go Unit Tests",
			Status:  testStatus,
			Message: "Automated unit tests execution",
			Output:  string(testOut),
		})
	}

	if hasNode {
		// Node Lint check
		var lintCmd *exec.Cmd
		packageJSONPath := filepath.Join(repoPath, "package.json")
		if containsNPMScript(packageJSONPath, "lint") {
			lintCmd = exec.Command("npm", "run", "lint")
		} else {
			lintCmd = exec.Command("npx", "tsc", "--noEmit")
		}
		lintCmd.Dir = repoPath
		lintOut, lintErr := lintCmd.CombinedOutput()
		lintStatus := "success"
		if lintErr != nil {
			lintStatus = "failure"
		}
		results = append(results, VerifyResult{
			Name:    "TypeScript/JavaScript Lint",
			Status:  lintStatus,
			Message: "Typechecks and code quality checks",
			Output:  string(lintOut),
		})

		// Node Test check
		if containsNPMScript(packageJSONPath, "test") {
			nodeTestCmd := exec.Command("npm", "run", "test")
			nodeTestCmd.Dir = repoPath
			nodeTestOut, nodeTestErr := nodeTestCmd.CombinedOutput()
			nodeTestStatus := "success"
			if nodeTestErr != nil {
				nodeTestStatus = "failure"
			}
			results = append(results, VerifyResult{
				Name:    "Node Unit Tests",
				Status:  nodeTestStatus,
				Message: "Frontend code tests suite",
				Output:  string(nodeTestOut),
			})
		}
	}

	if !hasGo && !hasNode {
		results = append(results, VerifyResult{
			Name:    "Generic Build Check",
			Status:  "skipped",
			Message: "No supported package managers found (go.mod or package.json missing)",
			Output:  "Skipped verification.",
		})
	}

	return results, nil
}

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

func containsNPMScript(packageJSONPath, scriptName string) bool {
	bytes, err := os.ReadFile(packageJSONPath)
	if err != nil {
		return false
	}
	var data struct {
		Scripts map[string]string `json:"scripts"`
	}
	if err := json.Unmarshal(bytes, &data); err != nil {
		return false
	}
	_, ok := data.Scripts[scriptName]
	return ok
}
