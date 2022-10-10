import React from "react"

function connectWebsocket() {
    if ('WebSocket' in window) {
        // Let us open a web socket
        var ws = new WebSocket('ws://localhost:3080')
        ws.onerror = connectWebsocket
        ws.onmessage = function (evt) {
            var received_msg = evt.data
            if (received_msg == "reload") {
                location.reload()
            }
            console.log('Message is received...', received_msg)
        }

        ws.onclose = function () {
            // websocket is closed.
            connectWebsocket()
            console.log('Connection is closed...')
        }
    } else {
        // The browser doesn't support WebSocket
        alert('WebSocket NOT supported by your Browser!')
    }
}

connectWebsocket()