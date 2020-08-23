const fs=require('fs');
const bencode=require('bencode');
const url=require('url');
const torrentParser=require('./torrent-parser');
const http=require('http');
const querystring=require('querystring');
const dgram=require('dgram');
const Buffer = require('buffer').Buffer;
const index=require('./index');
const crypto=require('crypto');
const util=require('./util.js');

module.exports.getPeers=(torrent,callback)=>{
  var link=url.parse(torrent['announce-list'][10].toString('utf8'));
  var socket=dgram.createSocket('udp4');
  socket.bind(6881);

  socket.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
  });

  socket.on('listening', () => {
    const address = socket.address();
    console.log(`server listening ${address.address}:${address.port}`);
  });

  udpSend(socket,buildConnReq(),link);

  socket.on('message',response=>{
    console.log(response.toString('utf8'));
    if(torrentParser.respType(response)==='connect'){
      var connResp=parseConnResp(response);
      var announceReq=buildAnnounceReq(connResp.connectionId,torrent);
      udpSend(socket,announceReq,link);
    }
    else if(torrentParser.respType(response)==='announce'){
      var announceResp=parseAnnounceResp(response);
      announceResp.peers.forEach((peer)=>{
        console.log(peer.ip.toString('utf8'));
      })
    }
  });

};

function udpSend(socket,msg,uri){
  console.log(uri.hostname,uri.port);
  socket.send(msg,0,msg.length,uri.port,uri.hostname,()=>{
    console.log('message sent');
  })
}

function buildConnReq() { //good

  const buf = Buffer.alloc(16); // 2

  // connection id
  buf.writeUInt32BE(0x417, 0); // 3
  buf.writeUInt32BE(0x27101980, 4);
  // action
  buf.writeUInt32BE(0, 8); // 4
  // transaction id
  crypto.randomBytes(4).copy(buf, 12); // 5

  return buf;
}

function parseConnResp(resp) { //good
  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    connectionId: resp.slice(8)
  }
}

function buildAnnounceReq(connId, torrent, port=6881) {
  console.log('here');
  const buf = Buffer.allocUnsafe(98);

  // connection id
  connId.copy(buf, 0);
  // action
  buf.writeUInt32BE(1, 8);
  // transaction id
  crypto.randomBytes(4).copy(buf, 12);
  // info hash
  torrentParser.infoHash(torrent).copy(buf, 16);
  // peerId
  util.genId().copy(buf, 36);
  // downloaded
  Buffer.alloc(8).copy(buf, 56);
  // left
  torrentParser.size(torrent).copy(buf, 64);
  // uploaded
  Buffer.alloc(8).copy(buf, 72);
  // event
  buf.writeUInt32BE(0, 80);
  // ip address
  buf.writeUInt32BE(0, 80);
  // key
  crypto.randomBytes(4).copy(buf, 88);
  // num want
  buf.writeInt32BE(-1, 92);
  // port
  buf.writeUInt16BE(port, 96);

  return buf;
}

function parseAnnounceResp(resp) { //good
  function group(iterable, groupSize) {
    let groups = [];
    for (let i = 0; i < iterable.length; i += groupSize) {
      groups.push(iterable.slice(i, i + groupSize));
    }
    return groups;
  }

  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    leechers: resp.readUInt32BE(8),
    seeders: resp.readUInt32BE(12),
    peers: group(resp.slice(20), 6).map(address => {
      return {
        ip: address.slice(0, 4).join('.'),
        port: address.readUInt16BE(4)
      }
    })
  }
}


module.exports.getPeers(index.torrent,()=>{});
