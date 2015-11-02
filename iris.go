package main

import (
    "net/http"
	"log"
	"os"
	"time"
	"path/filepath"
	"mime"
	"strconv"
	"io/ioutil"
)

func main() {
	http.Handle("/", StaticHandler{})
    log.Fatal(http.ListenAndServe(":4002", nil))
}

type StaticHandler struct{}

func (h StaticHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "max-age=0, must-revalidate")
	switch r.URL.Path {
	case "/":
		handle_index(w, r)
	default:
		handle_static(w, r)
	}
}
func handle_static(w http.ResponseWriter, r *http.Request) {
	path := "./s" + r.URL.Path
	stat, err := os.Stat(path)
	if err != nil {
		http.Error(w, "Not Found : "+r.URL.Path, 404)
		return
	}
	// 304
	modHdr := r.Header.Get("If-Modified-Since")
	modTime := stat.ModTime()
	w.Header().Set("Last-Modified", modTime.UTC().Format(time.RFC1123))
	hdrModTime, err := time.Parse(time.RFC1123, modHdr)
	if err == nil && modHdr != "" && modTime.Unix() <= hdrModTime.Unix() {
		w.WriteHeader(304)
		return
	}
	// Serve file
	ext := filepath.Ext(path)
	mimetype := mime.TypeByExtension(ext)
	w.Header().Set("Content-Type", mimetype)
	w.Header().Set("Content-Length", strconv.Itoa(int(stat.Size())))
	file, _ := ioutil.ReadFile(path)
	w.Write(file)
}
func handle_index(w http.ResponseWriter, r *http.Request) {
	file, _ := ioutil.ReadFile("./index.html")
	w.Write(file)
	// http.ServeFile(w, r, "./index.html")
}
