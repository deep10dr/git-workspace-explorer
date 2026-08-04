package health

import (
	"fmt"
	"os"
	"path/filepath"
	"git-workspace-explorer/pkg/gitengine"
)

// EvaluateHealth analyzes repository state and returns a comprehensive health report.
func EvaluateHealth(repo *gitengine.Repository, branches []gitengine.Branch, stashes []gitengine.Stash) gitengine.HealthReport {
	report := gitengine.HealthReport{
		Score:  100,
		Status: "healthy",
		Issues: make([]string, 0),
	}

	gitDir := filepath.Join(repo.Path, ".git")

	// 1. Check for operations in progress (Rebase, Merge, Cherry-pick)
	if _, err := os.Stat(filepath.Join(gitDir, "rebase-merge")); err == nil {
		report.HasRebaseOrMerge = true
		report.Issues = append(report.Issues, "Interactive Rebase operation in progress")
		report.Score -= 30
	} else if _, err := os.Stat(filepath.Join(gitDir, "rebase-apply")); err == nil {
		report.HasRebaseOrMerge = true
		report.Issues = append(report.Issues, "Rebase patch apply in progress")
		report.Score -= 30
	}

	if _, err := os.Stat(filepath.Join(gitDir, "MERGE_HEAD")); err == nil {
		report.HasRebaseOrMerge = true
		report.Issues = append(report.Issues, "Unfinished Merge operation with potential conflicts")
		report.Score -= 35
	}

	if _, err := os.Stat(filepath.Join(gitDir, "CHERRY_PICK_HEAD")); err == nil {
		report.Issues = append(report.Issues, "Cherry-pick operation in progress")
		report.Score -= 20
	}

	// 2. Detached HEAD
	if repo.IsDetached {
		report.IsDetachedHead = true
		report.Issues = append(report.Issues, "Repository is in Detached HEAD state")
		report.Score -= 25
	}

	// 3. Uncommitted Changes
	if !repo.Status.IsClean {
		report.HasUncommittedWork = true
		msg := fmt.Sprintf("Working tree has %d uncommitted file change(s)", repo.Status.TotalChanges)
		report.Issues = append(report.Issues, msg)
		report.Score -= 10
	}

	// 4. Unpushed Commits
	if repo.AheadCount > 0 {
		report.HasUnpushedCommits = true
		msg := fmt.Sprintf("Local branch is ahead by %d commit(s) not yet pushed to remote", repo.AheadCount)
		report.Issues = append(report.Issues, msg)
		report.Score -= 5
	}

	// 5. Old Stashes
	if len(stashes) > 5 {
		report.OldStashCount = len(stashes)
		msg := fmt.Sprintf("High stash count (%d stashes accumulated)", len(stashes))
		report.Issues = append(report.Issues, msg)
		report.Score -= 10
	}

	// 6. Stale Branches
	if len(branches) > 15 {
		report.StaleBranchCount = len(branches) - 10
		msg := fmt.Sprintf("Large number of local branches (%d total branches)", len(branches))
		report.Issues = append(report.Issues, msg)
		report.Score -= 5
	}

	// Final score normalization
	if report.Score < 0 {
		report.Score = 0
	}

	if report.Score >= 80 {
		report.Status = "healthy"
	} else if report.Score >= 50 {
		report.Status = "warning"
	} else {
		report.Status = "critical"
	}

	return report
}
