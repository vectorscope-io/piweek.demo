// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"text/template"

	"github.com/gorilla/mux"

	"github.com/aleasoluciones/serverstats"
)

var addr = flag.String("addr", ":8080", "http service address")
var indexTempl = template.Must(template.ParseFiles("index.html"))
var serverLoad = template.Must(template.ParseFiles("server-load.html"))

func serveHome(w http.ResponseWriter, r *http.Request) {
	fmt.Println("server home")
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	//indexTempl.Execute(w, r.Host)
	serverLoad.Execute(w, r.Host)
}

func main() {
	flag.Parse()
	r := mux.NewRouter()

	go h.run()

	serverStats := serverstats.NewServerStats(serverstats.DefaultPeriodes)
	go func() {
		for metric := range serverStats.Metrics {
			b, _ := json.Marshal(metric)
			// broadcast del mensaje usando el hub
			h.broadcast <- b
		}
	}()

	r.HandleFunc("/metrics", serveHome)
	r.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(serverStats.Metrics, w, r)
	})
	//r.PathPrefix("/").Handler(http.FileServer(http.Dir("./static/")))
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))
	http.Handle("/", r)
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
