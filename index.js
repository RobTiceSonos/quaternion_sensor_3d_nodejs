/**************************************************************************
 Serves static content in Public folder to browser
**************************************************************************/

var express = require('express')
var app = express();
const server_port = 3000

app.use(express.static(__dirname + '/public'));
app.listen(server_port, () => console.log(`App listening on port ${server_port}!`))

/**************************************************************************
 Reads quaternion data from pipe and sends it over the websocket
**************************************************************************/

const fs              = require('fs');
const { spawn, fork } = require('child_process');

const rx_pipe_name = 'quat9_pipe';
let rx_pipe = spawn('mkfifo', [rx_pipe_name]);  // Create IPC pipe

rx_pipe.on('exit', function(status) {
  console.log('Created IPC pipe');

  const fd   = fs.openSync(rx_pipe_name, 'r+');
  let fifoRs = fs.createReadStream(null, { fd });
  fifoRs.setEncoding('utf8');
  fifoRs.on('data', data => {
    console.log('Rx data: ' + data);
    if (ws != null) {
      ws.send(data);
    }
  });
});

/**************************************************************************
 Websocket server that communicates with browser
**************************************************************************/

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
var ws = null;

wss.on('connection', function connection(_ws) {
  ws = _ws;
});