package main

import (
	"fmt"
	"log"
	"net/http"
	"text/template"

	"github.com/aleasoluciones/serverstats"
	"github.com/regiluze/httpserver"
)

var serverLoad = template.Must(template.ParseFiles("html/serverstats.html"))
var serverstats3d = template.Must(template.ParseFiles("html/serverstats3d.html"))

type ServerStatsHandler struct {
	hub         *WSHub
	serverstats *serverstats.ServerStats
}

func NewServerStatsHandler(h *WSHub, serverStats *serverstats.ServerStats) *ServerStatsHandler {
	s := &ServerStatsHandler{hub: h, serverstats: serverStats}
	return s
}

func (ssh *ServerStatsHandler) serveHome(w http.ResponseWriter, r *http.Request) {
	fmt.Println("server stats")

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	serverLoad.Execute(w, r.Host)
}

func (ssh *ServerStatsHandler) serveStats3d(w http.ResponseWriter, r *http.Request) {
	fmt.Println("serve stats 3d")
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	serverstats3d.Execute(w, r.Host)
}

// serverWs handles websocket requests from the peer.
func (ssh *ServerStatsHandler) serveWs(hub *WSHub, metrics chan serverstats.Metric, w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	c := &connection{send: make(chan []byte, 256), ws: ws}
	hub.Register(c)

	go c.writePump()
	c.readPump(hub)
}

func (ssh *ServerStatsHandler) GetRoutes() []*httpserver.Route {

	serverstats := httpserver.NewRoute("serverstats", ssh.serveHome)
	serverstats3D := httpserver.NewRoute("serverstats3d", ssh.serveStats3d)
	ws := httpserver.NewRoute("ws", func(w http.ResponseWriter, r *http.Request) {
		ssh.serveWs(ssh.hub, ssh.serverstats.Metrics, w, r)
	})

	routes := []*httpserver.Route{serverstats, serverstats3D, ws}
	return routes
}
