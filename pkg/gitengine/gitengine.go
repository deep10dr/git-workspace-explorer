package gitengine

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// GenerateID produces a deterministic string ID based on repository absolute path.
func GenerateID(path string) string {
	hash := sha256.Sum256([]byte(path))
	return hex.EncodeToString(hash[:8])
}

// GetRepositoryDetails fetches comprehensive metadata for a single repository.
func GetRepositoryDetails(repoPath string) (*Repository, error) {
	name := filepath.Base(repoPath)

	branch, isDetached := GetCurrentBranch(repoPath)
	status := GetWorkingStatus(repoPath)
	lastCommit := GetLastCommit(repoPath)
	stashCount := GetStashCount(repoPath)
	ahead, behind := GetAheadBehindCount(repoPath, branch)

	repo := &Repository{
		ID:            GenerateID(repoPath),
		Name:          name,
		Path:          repoPath,
		CurrentBranch: branch,
		IsDetached:    isDetached,
		LastCommit:    lastCommit,
		Status:        status,
		StashCount:    stashCount,
		AheadCount:    ahead,
		BehindCount:   behind,
		LastActivity:  time.Now(),
	}

	if lastCommit != nil {
		repo.HeadSHA = lastCommit.SHA
		repo.LastActivity = lastCommit.Timestamp
	}

	return repo, nil
}

func GetCurrentBranch(repoPath string) (string, bool) {
	out, err := runGitCmd(repoPath, "symbolic-ref", "--short", "HEAD")
	if err == nil && strings.TrimSpace(out) != "" {
		return strings.TrimSpace(out), false
	}

	// Might be detached HEAD
	outHead, errHead := runGitCmd(repoPath, "rev-parse", "--short", "HEAD")
	if errHead == nil && strings.TrimSpace(outHead) != "" {
		return "HEAD detached at " + strings.TrimSpace(outHead), true
	}

	return "unknown", false
}

func GetWorkingStatus(repoPath string) WorkingStatus {
	out, err := runGitCmd(repoPath, "status", "--porcelain")
	if err != nil || strings.TrimSpace(out) == "" {
		return WorkingStatus{IsClean: true}
	}

	lines := strings.Split(strings.TrimSpace(out), "\n")
	status := WorkingStatus{
		IsClean:        false,
		ModifiedFiles:  make([]string, 0),
		AddedFiles:     make([]string, 0),
		DeletedFiles:   make([]string, 0),
		RenamedFiles:   make([]string, 0),
		UntrackedFiles: make([]string, 0),
		TotalChanges:   len(lines),
	}

	for _, line := range lines {
		if len(line) < 4 {
			continue
		}
		statusCode := line[:2]
		filePath := strings.TrimSpace(line[3:])

		if strings.Contains(statusCode, "?") {
			status.UntrackedFiles = append(status.UntrackedFiles, filePath)
		} else if strings.Contains(statusCode, "M") {
			status.ModifiedFiles = append(status.ModifiedFiles, filePath)
		} else if strings.Contains(statusCode, "A") {
			status.AddedFiles = append(status.AddedFiles, filePath)
		} else if strings.Contains(statusCode, "D") {
			status.DeletedFiles = append(status.DeletedFiles, filePath)
		} else if strings.Contains(statusCode, "R") {
			status.RenamedFiles = append(status.RenamedFiles, filePath)
		}
	}

	return status
}

func GetLastCommit(repoPath string) *CommitSummary {
	out, err := runGitCmd(repoPath, "log", "-1", "--format=%H%n%h%n%s%n%an%n%ae%n%at")
	if err != nil || strings.TrimSpace(out) == "" {
		return nil
	}

	parts := strings.Split(strings.TrimSpace(out), "\n")
	if len(parts) < 6 {
		return nil
	}

	unixSec, _ := strconv.ParseInt(parts[5], 10, 64)

	return &CommitSummary{
		SHA:       parts[0],
		ShortSHA:  parts[1],
		Message:   parts[2],
		Author:    parts[3],
		Email:     parts[4],
		Timestamp: time.Unix(unixSec, 0),
	}
}

func GetStashCount(repoPath string) int {
	out, err := runGitCmd(repoPath, "stash", "list")
	if err != nil || strings.TrimSpace(out) == "" {
		return 0
	}
	return len(strings.Split(strings.TrimSpace(out), "\n"))
}

func GetAheadBehindCount(repoPath, branch string) (int, int) {
	if strings.HasPrefix(branch, "HEAD detached") || branch == "unknown" {
		return 0, 0
	}

	out, err := runGitCmd(repoPath, "rev-list", "--left-right", "--count", branch+"...@{upstream}")
	if err != nil || strings.TrimSpace(out) == "" {
		return 0, 0
	}

	parts := strings.Fields(strings.TrimSpace(out))
	if len(parts) == 2 {
		ahead, _ := strconv.Atoi(parts[0])
		behind, _ := strconv.Atoi(parts[1])
		return ahead, behind
	}

	return 0, 0
}

func GetBranches(repoPath string) ([]Branch, error) {
	out, err := runGitCmd(repoPath, "branch", "-a", "--format=%(refname:short)|%(HEAD)|%(objectname:short)|%(authorname)|%(committerdate:unix)|%(upstream:short)")
	if err != nil {
		return nil, err
	}

	lines := strings.Split(strings.TrimSpace(out), "\n")
	var branches []Branch

	for _, line := range lines {
		if strings.TrimSpace(line) == "" {
			continue
		}
		parts := strings.Split(line, "|")
		if len(parts) < 5 {
			continue
		}

		name := parts[0]
		isHead := parts[1] == "*"
		sha := parts[2]
		author := parts[3]
		unixSec, _ := strconv.ParseInt(parts[4], 10, 64)

		upstream := ""
		if len(parts) >= 6 {
			upstream = parts[5]
		}

		isRemote := strings.HasPrefix(name, "origin/") || strings.HasPrefix(name, "remotes/")

		branches = append(branches, Branch{
			Name:          name,
			IsCurrent:     isHead,
			IsRemote:      isRemote,
			LastCommitSHA: sha,
			Author:        author,
			LastCheckout:  time.Unix(unixSec, 0),
			Upstream:      upstream,
		})
	}

	return branches, nil
}

func GetCommits(repoPath string, limit int) ([]CommitSummary, error) {
	if limit <= 0 {
		limit = 60
	}
	out, err := runGitCmd(repoPath, "log", fmt.Sprintf("-n %d", limit), "--format=%H%n%h%n%P%n%D%n%s%n%an%n%ae%n%at%n---COMMIT_END---")
	if err != nil {
		return nil, err
	}

	blocks := strings.Split(out, "---COMMIT_END---")
	var commits []CommitSummary

	for _, block := range blocks {
		parts := strings.Split(strings.TrimSpace(block), "\n")
		if len(parts) < 8 {
			continue
		}

		parents := make([]string, 0)
		if strings.TrimSpace(parts[2]) != "" {
			parents = strings.Fields(parts[2])
		}

		refs := make([]string, 0)
		if strings.TrimSpace(parts[3]) != "" {
			rawRefs := strings.Split(parts[3], ",")
			for _, r := range rawRefs {
				clean := strings.TrimSpace(r)
				if clean != "" {
					refs = append(refs, clean)
				}
			}
		}

		unixSec, _ := strconv.ParseInt(parts[7], 10, 64)
		commits = append(commits, CommitSummary{
			SHA:        parts[0],
			ShortSHA:   parts[1],
			ParentSHAs: parents,
			Refs:       refs,
			Message:    parts[4],
			Author:     parts[5],
			Email:      parts[6],
			Timestamp:  time.Unix(unixSec, 0),
		})
	}

	return commits, nil
}

func GetStashes(repoPath string) ([]Stash, error) {
	out, err := runGitCmd(repoPath, "stash", "list", "--format=%gd|%s|%at")
	if err != nil || strings.TrimSpace(out) == "" {
		return []Stash{}, nil
	}

	lines := strings.Split(strings.TrimSpace(out), "\n")
	var stashes []Stash

	for idx, line := range lines {
		parts := strings.Split(line, "|")
		if len(parts) < 3 {
			continue
		}

		ref := parts[0]
		msg := parts[1]
		unixSec, _ := strconv.ParseInt(parts[2], 10, 64)

		// Get files inside stash
		files := GetStashFiles(repoPath, ref)

		stashes = append(stashes, Stash{
			Index:      idx,
			Ref:        ref,
			Message:    msg,
			Timestamp:  time.Unix(unixSec, 0),
			Files:      files,
			IsFavorite: false,
			Tags:       make([]string, 0),
		})
	}

	return stashes, nil
}

func GetStashFiles(repoPath, stashRef string) []StashFile {
	out, err := runGitCmd(repoPath, "stash", "show", "--name-status", stashRef)
	if err != nil || strings.TrimSpace(out) == "" {
		return []StashFile{}
	}

	lines := strings.Split(strings.TrimSpace(out), "\n")
	var files []StashFile
	for _, line := range lines {
		parts := strings.Fields(line)
		if len(parts) >= 2 {
			files = append(files, StashFile{
				Status: parts[0],
				Path:   parts[1],
			})
		}
	}
	return files
}

func GetFileDiff(repoPath, filePath string) (string, error) {
	out, err := runGitCmd(repoPath, "diff", "HEAD", "--", filePath)
	if err != nil || strings.TrimSpace(out) == "" {
		// Fallback to untracked file output
		content, errRead := os.ReadFile(filepath.Join(repoPath, filePath))
		if errRead == nil {
			return fmt.Sprintf("+++ b/%s\n@@ -0,0 +1,%d @@\n%s", filePath, len(strings.Split(string(content), "\n")), string(content)), nil
		}
		return "", err
	}
	return out, nil
}

func GetCommitFiles(repoPath, commitSHA string) ([]StashFile, error) {
	out, err := runGitCmd(repoPath, "show", "--name-status", "--oneline", commitSHA)
	if err != nil || strings.TrimSpace(out) == "" {
		return []StashFile{}, nil
	}

	lines := strings.Split(strings.TrimSpace(out), "\n")
	var files []StashFile
	// First line is commit subject line, skip it
	if len(lines) > 1 {
		lines = lines[1:]
	}

	for _, line := range lines {
		parts := strings.Fields(line)
		if len(parts) >= 2 {
			files = append(files, StashFile{
				Status: parts[0],
				Path:   parts[1],
			})
		}
	}
	return files, nil
}

func GetCommitFileDiff(repoPath, commitSHA, filePath string) (string, error) {
	out, err := runGitCmd(repoPath, "show", commitSHA, "--", filePath)
	if err != nil {
		return "", err
	}
	return out, nil
}

func GetStashFileDiff(repoPath, stashRef, filePath string) (string, error) {
	out, err := runGitCmd(repoPath, "stash", "show", "-p", stashRef, "--", filePath)
	if err != nil {
		return "", err
	}
	return out, nil
}

func runGitCmd(dir string, args ...string) (string, error) {
	cmd := exec.Command("git", args...)
	cmd.Dir = dir
	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr

	err := cmd.Run()
	if err != nil {
		return "", fmt.Errorf("%v: %s", err, stderr.String())
	}
	return out.String(), nil
}
