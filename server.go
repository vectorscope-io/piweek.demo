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
var serverLoad = template.Must(template.ParseFiles("serverstats.html"))
var serverstats3d = template.Must(template.ParseFiles("serverstats3d.html"))

func serveHome(w http.ResponseWriter, r *http.Request) {
	fmt.Println("server stats")
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	serverLoad.Execute(w, r.Host)
}

func serveStats3d(w http.ResponseWriter, r *http.Request) {
	fmt.Println("serve stats 3d")
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	serverstats3d.Execute(w, r.Host)
}

type Server struct{}

func NewServer() *Server {
	s := &Server{}
	return s
}

func (s *Server) start() {
	r := mux.NewRouter()
	hub := NewWSHub()
	serverStats := serverstats.NewServerStats(serverstats.DefaultPeriodes)
	go func() {
		for metric := range serverStats.Metrics {
			b, _ := json.Marshal(metric)
			hub.Broadcast(b)
		}
	}()

	r.HandleFunc("/serverstats", serveHome)
	r.HandleFunc("/serverstats3d", serveStats3d)
	r.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, serverStats.Metrics, w, r)
	})
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))
	http.Handle("/", r)
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
