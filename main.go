// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"encoding/json"
	"flag"

	"github.com/aleasoluciones/serverstats"
)

func main() {
	flag.Parse()

	hub := NewWSHub()
	serverStats := serverstats.NewServerStats(serverstats.DefaultPeriodes)
	go func() {
		for metric := range serverStats.Metrics {
			b, _ := json.Marshal(metric)
			hub.Broadcast(b)
		}
	}()

	server := NewServer()
	server.start()
}
