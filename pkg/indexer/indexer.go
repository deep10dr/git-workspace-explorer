package indexer

import (
	"fmt"
	"strings"
	"sync"

	"git-workspace-explorer/pkg/gitengine"
)

type MemoryIndex struct {
	mu           sync.RWMutex
	repositories map[string]*gitengine.Repository
	branches     map[string][]gitengine.Branch
	stashes      map[string][]gitengine.Stash
	commits      map[string][]gitengine.CommitSummary
}

func NewIndex() *MemoryIndex {
	return &MemoryIndex{
		repositories: make(map[string]*gitengine.Repository),
		branches:     make(map[string][]gitengine.Branch),
		stashes:      make(map[string][]gitengine.Stash),
		commits:      make(map[string][]gitengine.CommitSummary),
	}
}

func (idx *MemoryIndex) StoreRepository(repo *gitengine.Repository, branches []gitengine.Branch, stashes []gitengine.Stash, commits []gitengine.CommitSummary) {
	idx.mu.Lock()
	defer idx.mu.Unlock()

	idx.repositories[repo.ID] = repo
	idx.branches[repo.ID] = branches
	idx.stashes[repo.ID] = stashes
	idx.commits[repo.ID] = commits
}

func (idx *MemoryIndex) Search(query string) []gitengine.SearchResult {
	idx.mu.RLock()
	defer idx.mu.RUnlock()

	q := strings.ToLower(strings.TrimSpace(query))
	if q == "" {
		return []gitengine.SearchResult{}
	}

	var results []gitengine.SearchResult

	// 1. Search Repositories
	for _, repo := range idx.repositories {
		if strings.Contains(strings.ToLower(repo.Name), q) || strings.Contains(strings.ToLower(repo.Path), q) {
			results = append(results, gitengine.SearchResult{
				Type:           "repo",
				RepositoryID:   repo.ID,
				RepositoryName: repo.Name,
				Title:          repo.Name,
				Subtitle:       repo.Path,
				Ref:            repo.CurrentBranch,
				Snippet:        fmt.Sprintf("Branch: %s | Changes: %d", repo.CurrentBranch, repo.Status.TotalChanges),
			})
		}
	}

	// 2. Search Branches
	for repoID, branchList := range idx.branches {
		repo := idx.repositories[repoID]
		if repo == nil {
			continue
		}
		for _, branch := range branchList {
			if strings.Contains(strings.ToLower(branch.Name), q) {
				results = append(results, gitengine.SearchResult{
					Type:           "branch",
					RepositoryID:   repo.ID,
					RepositoryName: repo.Name,
					Title:          branch.Name,
					Subtitle:       fmt.Sprintf("In %s", repo.Name),
					Ref:            branch.Name,
					Snippet:        fmt.Sprintf("Author: %s | SHA: %s", branch.Author, branch.LastCommitSHA),
				})
			}
		}
	}

	// 3. Search Commits
	for repoID, commitList := range idx.commits {
		repo := idx.repositories[repoID]
		if repo == nil {
			continue
		}
		for _, commit := range commitList {
			if strings.Contains(strings.ToLower(commit.Message), q) || strings.Contains(strings.ToLower(commit.SHA), q) || strings.Contains(strings.ToLower(commit.Author), q) {
				results = append(results, gitengine.SearchResult{
					Type:           "commit",
					RepositoryID:   repo.ID,
					RepositoryName: repo.Name,
					Title:          commit.ShortSHA + " - " + commit.Message,
					Subtitle:       fmt.Sprintf("By %s in %s", commit.Author, repo.Name),
					Ref:            commit.SHA,
					Snippet:        commit.Timestamp.Format("2006-01-02 15:04"),
				})
			}
		}
	}

	// 4. Search Stashes
	for repoID, stashList := range idx.stashes {
		repo := idx.repositories[repoID]
		if repo == nil {
			continue
		}
		for _, stash := range stashList {
			if strings.Contains(strings.ToLower(stash.Message), q) {
				results = append(results, gitengine.SearchResult{
					Type:           "stash",
					RepositoryID:   repo.ID,
					RepositoryName: repo.Name,
					Title:          fmt.Sprintf("Stash #%d: %s", stash.Index, stash.Message),
					Subtitle:       fmt.Sprintf("In %s", repo.Name),
					Ref:            stash.Ref,
					Snippet:        fmt.Sprintf("%d files stashed", len(stash.Files)),
				})
			}
		}
	}

	return results
}
