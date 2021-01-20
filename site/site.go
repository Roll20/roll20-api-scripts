package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"os"
	"path/filepath"
	"strings"
)

// Script defines the parameters that appear in a script.json file.
type Script struct {
	Name             string      `json:"name"`
	Script           string      `json:"script"`
	Version          string      `json:"version"`
	Previousversions []string    `json:"previousversions"`
	Description      string      `json:"description"`
	Authors          string      `json:"authors"`
	Roll20Userid     json.Number `json:"roll20userid"`
	Useroptions      []struct {
		Name        string   `json:"name"`
		Type        string   `json:"type"`
		Default     string   `json:"default"`
		Description string   `json:"description"`
		Options     []string `json:"options"`
		Value       string   `json:"value"`
		Checked     string   `json:"checked"`
	} `json:"useroptions"`
	Dependencies []string          `json:"dependencies"`
	Modifies     map[string]string `json:"modifies"`
	Conflicts    []string          `json:"conflicts"`
}

// Parse templates at runtime start. Panic on failure.
var pageT = template.Must(template.ParseFiles("page.gohtml"))
var indexT = template.Must(template.ParseFiles("index.gohtml"))

func main() {

	// Rebuild output dir
	if err := os.RemoveAll("./build"); err != nil {
		log.Fatal(err)
	}
	if err := os.MkdirAll("./build/", 0755); err != nil {
		log.Fatal(err)
	}

	// Get file list
	files, err := filepath.Glob("../**/script.json")
	if err != nil {
		log.Fatal(err)
	}

	dirs := map[string]string{}

	// Parse each file
	for _, file := range files {
		log.Println("Processing", file)
		if err := parseFile(file, dirs); err != nil {
			log.Printf("error on %q: %v", file, err)
		}
	}

	// Write index list
	index, err := os.Create("./build/index.html")
	if err != nil {
		log.Fatalf("could not make index file: %v", err)
	}
	defer index.Close()

	if err := indexT.Execute(index, dirs); err != nil {
		log.Fatalf("could not execute template: %v", err)
	}

	if err := index.Close(); err != nil {
		log.Fatalf("could not write template: %v", err)
	}
}

func parseFile(name string, dirs map[string]string) error {
	f, err := os.Open(name)
	if err != nil {
		return fmt.Errorf("could not open: %w", err)
	}
	defer f.Close()

	var data Script
	if err := json.NewDecoder(f).Decode(&data); err != nil {
		return fmt.Errorf("could not decode: %w", err)
	}

	dir := strings.ReplaceAll(data.Name, " /", "_")

	if err := os.Mkdir("./build/"+dir, 0755); err != nil {
		return fmt.Errorf("could not make dir: %w", err)
	}

	index, err := os.Create("./build/" + dir + "/index.html")
	if err != nil {
		return fmt.Errorf("could not make index file: %w", err)
	}
	defer index.Close()

	if err := pageT.Execute(index, data); err != nil {
		return fmt.Errorf("could not execute template: %w", err)
	}

	if err := index.Close(); err != nil {
		return fmt.Errorf("could not write template: %w", err)
	}

	dirs[data.Name] = dir
	return nil
}
