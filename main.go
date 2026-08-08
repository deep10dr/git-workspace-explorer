package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"git-workspace-explorer/pkg/api"
)

// Go embed static frontend build files if present
//
//go:embed frontend/dist/*
var frontendFS embed.FS

const (
	ColorYellow      = "\033[1;33m"
	ColorYellowBg    = "\033[43;30;1m"
	ColorNeonGreen   = "\033[1;92m"
	ColorReset       = "\033[0m"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	workspaceDir := os.Getenv("WORKSPACE_DIR")
	if workspaceDir == "" {
		workspaceDir = "/workspaces"
	}

	fmt.Printf("%s ⚡ INITIALIZING BACKEND ENGINE ⚡ %s\n", ColorYellowBg, ColorReset)
	log.Printf("%s📁 Workspace scan directory:%s %s", ColorNeonGreen, ColorReset, workspaceDir)

	server := api.NewServer(workspaceDir)
	mux := http.NewServeMux()

	server.RegisterRoutes(mux)

	// Serve Frontend Static Files
	distSubFS, err := fs.Sub(frontendFS, "frontend/dist")
	if err == nil {
		fileServer := http.FileServer(http.FS(distSubFS))
		mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")

			if strings.HasPrefix(r.URL.Path, "/api/") {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusNotFound)
				w.Write([]byte(`{"error": "API route not found"}`))
				return
			}

			f, errOpen := distSubFS.Open(filepath.Clean(strings.TrimPrefix(r.URL.Path, "/")))
			if errOpen == nil {
				f.Close()
				fileServer.ServeHTTP(w, r)
				return
			}

			r.URL.Path = "/"
			fileServer.ServeHTTP(w, r)
		}))
	} else {
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Write([]byte("Git Workspace Explorer API Server is running."))
		})
	}

	fmt.Printf("\n%s🌐 SERVER ONLINE:%s %shttp://0.0.0.0:%s%s\n\n", ColorNeonGreen, ColorReset, ColorYellow, port, ColorReset)

	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
