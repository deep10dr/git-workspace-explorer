package api

import (
	"encoding/json"
	"net/http"
	"os"
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

func (s *Server) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/workspace/overview", s.handleOverview)
	mux.HandleFunc("/api/repositories", s.handleRepositories)
	mux.HandleFunc("/api/repositories/", s.handleRepositoryDetail)
	mux.HandleFunc("/api/search", s.handleSearch)
	mux.HandleFunc("/api/scan", s.handleScan)
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
