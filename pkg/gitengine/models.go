package gitengine

import "time"

// Repository represents a discovered Git repository and its summary state.
type Repository struct {
	ID            string         `json:"id"`
	Name          string         `json:"name"`
	Path          string         `json:"path"`
	CurrentBranch string         `json:"currentBranch"`
	IsDetached    bool           `json:"isDetached"`
	HeadSHA       string         `json:"headSha"`
	LastCommit    *CommitSummary `json:"lastCommit,omitempty"`
	Status        WorkingStatus  `json:"status"`
	StashCount    int            `json:"stashCount"`
	AheadCount    int            `json:"aheadCount"`
	BehindCount   int            `json:"behindCount"`
	LastActivity  time.Time      `json:"lastActivity"`
	Health        HealthReport   `json:"health"`
}

type CommitSummary struct {
	SHA        string    `json:"sha"`
	ShortSHA   string    `json:"shortSha"`
	Message    string    `json:"message"`
	Author     string    `json:"author"`
	Email      string    `json:"email"`
	Timestamp  time.Time `json:"timestamp"`
	ParentSHAs []string  `json:"parentShas"`
	Refs       []string  `json:"refs"`
}

type WorkingStatus struct {
	IsClean        bool     `json:"isClean"`
	ModifiedFiles  []string `json:"modifiedFiles"`
	AddedFiles     []string `json:"addedFiles"`
	DeletedFiles   []string `json:"deletedFiles"`
	RenamedFiles   []string `json:"renamedFiles"`
	UntrackedFiles []string `json:"untrackedFiles"`
	TotalChanges   int      `json:"totalChanges"`
}

type HealthReport struct {
	Score              int      `json:"score"` // 0 - 100
	Status             string   `json:"status"` // "healthy", "warning", "critical"
	Issues             []string `json:"issues"`
	HasUncommittedWork bool     `json:"hasUncommittedWork"`
	HasUnpushedCommits bool     `json:"hasUnpushedCommits"`
	HasRebaseOrMerge   bool     `json:"hasRebaseOrMerge"`
	IsDetachedHead     bool     `json:"isDetachedHead"`
	StaleBranchCount   int      `json:"staleBranchCount"`
	OldStashCount      int      `json:"oldStashCount"`
}

type Branch struct {
	Name          string    `json:"name"`
	IsCurrent     bool      `json:"isCurrent"`
	IsRemote      bool      `json:"isRemote"`
	LastCommit    string    `json:"lastCommit"`
	LastCommitSHA string    `json:"lastCommitSha"`
	Author        string    `json:"author"`
	LastCheckout  time.Time `json:"lastCheckout"`
	Ahead         int       `json:"ahead"`
	Behind        int       `json:"behind"`
	IsMerged      bool      `json:"isMerged"`
	Upstream      string    `json:"upstream"`
}

type Stash struct {
	Index       int        `json:"index"`
	Ref         string     `json:"ref"`
	BranchName  string     `json:"branchName"`
	Message     string     `json:"message"`
	Timestamp   time.Time  `json:"timestamp"`
	Files       []StashFile`json:"files"`
	IsFavorite  bool       `json:"isFavorite"`
	Tags        []string   `json:"tags"`
	UserNote    string     `json:"userNote"`
}

type StashFile struct {
	Path   string `json:"path"`
	Status string `json:"status"` // M, A, D
}

type FileDiff struct {
	OldPath string `json:"oldPath"`
	NewPath string `json:"newPath"`
	Status  string `json:"status"`
	Hunks   []Hunk `json:"hunks"`
	RawDiff string `json:"rawDiff"`
}

type Hunk struct {
	Header string `json:"header"`
	Lines  []Line `json:"lines"`
}

type Line struct {
	Type    string `json:"type"` // "+", "-", " "
	Content string `json:"content"`
	OldNum  int    `json:"oldNum"`
	NewNum  int    `json:"newNum"`
}

type WorkspaceOverview struct {
	TotalRepositories int `json:"totalRepositories"`
	CleanRepositories int `json:"cleanRepositories"`
	DirtyRepositories int `json:"dirtyRepositories"`
	TotalBranches     int `json:"totalBranches"`
	TotalStashes      int `json:"totalStashes"`
	UnpushedCommits   int `json:"unpushedCommits"`
	WarningIssues     int `json:"warningIssues"`
}

type SearchResult struct {
	Type           string `json:"type"` // "repo", "branch", "commit", "stash", "file"
	RepositoryID   string `json:"repositoryId"`
	RepositoryName string `json:"repositoryName"`
	Title          string `json:"title"`
	Subtitle       string `json:"subtitle"`
	Ref            string `json:"ref"`
	Snippet        string `json:"snippet"`
}
