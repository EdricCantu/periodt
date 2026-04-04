const WSS = require('ws').WebSocketServer;

state = {schedule: "regular", codes: [], bell: "automatic", offset: 0};
syncIntervalTime = 10;
syncIntervalID = 0;

const wss = new WSS({ port: 8080 });
const clients = [];
wss.on('connection', ws=>{
  ws.send("sync "+JSON.stringify(state))
  //work on storing prestringified state
  ws.on('error', err=>{
    console.error(err);
    ws.close();//does server side closure trigger the event?
  });
  //ws.on('message', ()=>{});
  ws.on("close", ()=>{
    const index = clients.indexOf(ws);
    if (index !== -1) clients.splice(index, 1);
  })
  clients.push(ws);
});

const rl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'periodt> '
});

rl.prompt();


rl.on('line', line=>{
  line = line.trim().split(" ");
  var mul = 1;
  switch(line.shift()){
    case "state":
      line = line.join(" ");
      if(line){
        var option;
        try{
          option = JSON.parse(line)
        }catch{
          console.log("ERRORED> Couldn't parse state patch");
        }
        if(option){
          if(typeof(option) != "object"){
            console.error("ERRORED> State patch should be an object")
          }else{
            patch(option);
          }
        }
      }else{
        console.log(state)
      }
      break;
    case "db"://display before bell
      mul = -1;
    case "bd"://bell before display
      line = line.join(" ");
      var option;
      try{
        option = JSON.parse(line)
      }catch{
        console.log("XXX> Couldn't parse bell offset");
      }
      if(option){
        if(typeof(option) != "number"){
          console.error("XXX> Relative bell offset should be an integer")
        }else{
          option = Math.round(option)
          option *= mul;
          option = {offset: state.offset + option};
          patch(option);
        }
      }
      break;
    case "syncinterval":
      line = line.join(" ");
      var option;
      try{
        option = JSON.parse(line)
      }catch{
        console.log("XXX> Couldn't parse sync interval");
      }
      if(typeof(option) != "number"){
        console.error("XXX> sync interval should be an integer")
      }else{
        syncIntervalTime = Math.round(option);
        if(syncIntervalTime === 0){
          console.error("XXX> sync interval should not be zero or near-zero");
        }else{
          sync()
        }
      }
      break;
    case "sync":
      line = line.join(" ");
      if(line){
        console.error("XXX> The \"sync\" command does not use any arguments")
      }else{
        sync()
      }
      break;
    case "ppl":
      line = line.join(" ");
      if(line){
        console.error("XXX> The \"ppl\" command does not use any arguments")
      }else{
        console.log("ppl> "+clients.length);
      }
  }
  rl.prompt();
});

rl.on('close', () => {
  console.log('FIN');
  process.exit(0);
});
function patch(option){
  state = {...state, ...option}
  publish("patch " + JSON.stringify(option))
  console.log("patched> ", state)
}
function publish(info){
  for(const client of clients){
    if (client.readyState === 1) client.send(info);
  }
}

function sync(){
  clearTimeout(syncIntervalID);
  publish("sync " + JSON.stringify(state));
  syncIntervalID = setTimeout(sync, syncIntervalTime*60000)
  console.log("synced> ", state)
}
sync()
