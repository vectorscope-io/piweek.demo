// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"fmt"
)

// hub maintains the set of active connections and broadcasts messages to the
// connections.
type hub struct {
	// Registered connections.
	connections map[*connection]bool

	// Inbound messages from the connections.
	broadcast chan []byte

	// Register requests from the connections.
	register chan *connection

	// Unregister requests from connections.
	unregister chan *connection

	// subscription command messages
	subscription chan SubscriptionMessage

	topicsSubscribers map[string]map[*connection]bool
}

const (
	SUBSCRIBE = iota
	UNSUBSCRIBE
)

type SubscriptionMessage struct {
	cmd        int
	topic      string
	connection *connection
}

var h = hub{
	broadcast:         make(chan []byte),
	register:          make(chan *connection),
	unregister:        make(chan *connection),
	subscription:      make(chan SubscriptionMessage),
	connections:       make(map[*connection]bool),
	topicsSubscribers: make(map[string]map[*connection]bool),
}

func (h *hub) run() {
	for {
		select {
		case subscriptionMessage := <-h.subscription:
			switch subscriptionMessage.cmd {
			case SUBSCRIBE:
				if h.topicsSubscribers[subscriptionMessage.topic] == nil {
					h.topicsSubscribers[subscriptionMessage.topic] = make(map[*connection]bool)
				}
				h.topicsSubscribers[subscriptionMessage.topic][subscriptionMessage.connection] = true
			case UNSUBSCRIBE:
				fmt.Println("EFA UNSUBSCRIPTION", subscriptionMessage.topic)
			}
		case c := <-h.register:
			h.connections[c] = true
		case c := <-h.unregister:
			if _, ok := h.connections[c]; ok {
				delete(h.connections, c)
				close(c.send)
			}
		case m := <-h.broadcast:
			for c := range h.connections {
				select {
				case c.send <- m:
				default:
					close(c.send)
					delete(h.connections, c)
				}
			}
		}
	}
}
