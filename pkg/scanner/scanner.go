package scanner

import "os"
import "path/filepath"
import "strings"
import "sync"

// SkipDirs contains folder names that should never be recursed into.
var SkipDirs = map[string]bool{
	"node_modules": true,
	".venv":        true,
	"venv":         true,
	"vendor":       true,
	"target":       true,
	".cache":       true,
	".build":       true,
	"build":        true,
	"dist":         true,
	".next":        true,
	".git":         true,
	"Library":      true,
	".gradle":      true,
}

// DiscoverRepositories scans target roots concurrently for Git repositories.
func DiscoverRepositories(roots []string) ([]string, error) {
	var repoPaths []string
	var mu sync.Mutex
	var wg sync.WaitGroup

	for _, root := range roots {
		if strings.TrimSpace(root) == "" {
			continue
		}

		// Verify path exists
		info, err := os.Stat(root)
		if err != nil || !info.IsDir() {
			continue
		}

		wg.Add(1)
		go func(r string) {
			defer wg.Done()
			found := scanDirectory(r)

			mu.Lock()
			repoPaths = append(repoPaths, found...)
			mu.Unlock()
		}(root)
	}

	wg.Wait()
	return deduplicate(repoPaths), nil
}

func scanDirectory(dir string) []string {
	var repos []string

	// Check if this directory is itself a git repository
	gitFolder := filepath.Join(dir, ".git")
	if info, err := os.Stat(gitFolder); err == nil {
		if info.IsDir() || isGitFile(gitFolder) {
			return []string{dir}
		}
	}

	entries, err := os.ReadDir(dir)
	if err != nil {
		return repos
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		name := entry.Name()
		if strings.HasPrefix(name, ".") || SkipDirs[name] {
			continue
		}

		subPath := filepath.Join(dir, name)

		// Check if subPath is a git repo
		subGit := filepath.Join(subPath, ".git")
		if info, err := os.Stat(subGit); err == nil && (info.IsDir() || isGitFile(subGit)) {
			repos = append(repos, subPath)
			continue
		}

		// Recurse down
		nested := scanDirectory(subPath)
		repos = append(repos, nested...)
	}

	return repos
}

func isGitFile(path string) bool {
	// Handles git worktrees where .git is a file pointing to main repo
	info, err := os.Stat(path)
	return err == nil && !info.IsDir()
}

func deduplicate(list []string) []string {
	seen := make(map[string]bool)
	var result []string
	for _, item := range list {
		clean := filepath.Clean(item)
		if !seen[clean] {
			seen[clean] = true
			result = append(result, clean)
		}
	}
	return result
}
