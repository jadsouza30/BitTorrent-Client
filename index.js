const fs=require('fs');
const bencode=require('bencode');
const url=require('url');
const torrentParser=require('./torrent-parser');
const http=require('http');
const querystring=require('querystring');
const dgram=require('dgram');
const Buffer = require('buffer').Buffer;

module.exports.torrent=bencode.decode(fs.readFileSync('acok2.torrent'));
