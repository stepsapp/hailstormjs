function connectWebsocket() {
  // eslint-disable-next-line no-undef
  if ('WebSocket' in window) {
    // Let us open a web socket
    // eslint-disable-next-line no-undef
    const ws = new WebSocket('ws://localhost:3080');
    ws.onmessage = (evt) => {
      const receivedMsg = evt.data;
      if (receivedMsg === 'reload') {
        // eslint-disable-next-line no-undef, no-restricted-globals
        location.reload();
      }
      // eslint-disable-next-line no-console
      console.log('Reloading page...', receivedMsg);
    };

    ws.onclose = () => {
      // eslint-disable-next-line no-console
      console.log('Connection is closed... Reload Page and check if server is running');
    };
  } else {
    // The browser doesn't support WebSocket
    // eslint-disable-next-line no-console, no-alert, no-undef
    alert('WebSocket NOT supported by your Browser!');
  }
}

connectWebsocket();
