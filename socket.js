const net=require('net');
const index=require('./index');
const uParse=require('url').parse;

var url=uParse(index.announce.toString('utf8'));
var client=new net.Socket();


client.connect(
  url.port,
  url.hostname,
  ()=>{
    console.log('connected');
  }
);
