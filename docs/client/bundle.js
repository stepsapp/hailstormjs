(()=>{function c(){if("WebSocket"in window){let e=new WebSocket("ws://localhost:3080");e.onmessage=n=>{let o=n.data;o==="reload"&&location.reload(),console.log("Reloading page...",o)},e.onclose=()=>{console.log("Connection is closed... Reload Page and check if server is running")}}else alert("WebSocket NOT supported by your Browser!")}c();})();
