// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"flag"
	"log"
	"net/http"
	"text/template"
	"fmt"
//	"strings"
)

var addr = flag.String("addr", ":8080", "http service address")
var homeTempl = template.Must(template.ParseFiles("home.html"))
var indexTempl = template.Must(template.ParseFiles("index.html"))


func serveHome(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Egi >> ", r.URL.Path)
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	indexTempl.Execute(w, r.Host)
}


func main() {
	flag.Parse()
	go h.run()
	http.HandleFunc("/metrics", serveHome)
	http.HandleFunc("/ws", serveWs)
//	http.Handle("/js/", http.FileServer(http.Dir("./js/")))
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
