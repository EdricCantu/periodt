//Words I cant spell right on the first try: opportunity february benefiting
endpoints = [
  "https://time.now/developer/api/ip",
  "http://worldclockapi.com/api/json/ct/now",
  
  //worldtimeapi.org
  //timeapi.io
  //timeapi.world
  //timeanddate.com
  //timeapi.org
];

const endpoint = endpoints[0];
x = performance.now()
y = await (await fetch(endpoint)).json();
x = performance.now() - x;
console.log(y,x)
