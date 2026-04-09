//Words I cant spell right on the first try: opportunity february benefiting

//is this valid for calculating offsets based on a single request (to which multiple outputs will be aggregated for accuracy)
function getoffset(i){
  return new Promise((res,rej)=>{
    var u;
         if(i == 0) u = "https://time.now/developer/api/ip";
    else if(i == 1) u = "http://worldclockapi.com/api/json/ct/now";
    else            rej(new Error("badurl"));
    const start = performance.now();
    fetch(u).then(f=>{
      const current = Date.now();
      const end = performance.now();
      const latency = end - start;
      const error = latency / 2;
      const adjcurrent = current - error;//estimate what the system time was when the server time was calculated
      f.json().then(j=>{
        if(i == 0){
          const givenservertime = (new Date(j.datetime)).getTime();
          res({offset: adjcurrent - givenservertime, error});
        }
        if(i == 1) res(j);
      })
    }).catch(rej)
  })
}

