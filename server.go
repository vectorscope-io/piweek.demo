package main

import (
	"encoding/json"
	"flag"
	"log"

	"github.com/aleasoluciones/serverstats"
	"github.com/regiluze/httpserver"
)

var addr = flag.String("addr", "0.0.0.0", "http service address")
var port = flag.String("port", "8080", "http service port")

type Server struct{}

func NewServer() *Server {
	s := &Server{}
	return s
}

func (s *Server) start() {
	hub := NewWSHub()
	serverStats := serverstats.NewServerStats(serverstats.DefaultPeriodes)
	serverStatsApp := NewServerStatsHandler(hub, serverStats)

	go func() {
		for metric := range serverStats.Metrics {
			b, _ := json.Marshal(metric)
			hub.Broadcast(b)
		}
	}()

	httpserver := httpserver.NewHttpServer(*addr, *port)
	httpserver.DeployAtBase(serverStatsApp)
	err := httpserver.Start()
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
