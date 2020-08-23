const fs=require('fs');
const bencode=require('bencode');
const url=require('url');
const torrentParser=require('./torrent-parser');
const http=require('http');
const querystring=require('querystring');

var torrent=bencode.decode(fs.readFileSync('[limetorrents.info]FreeCourseWeb.com.].Software.Quality-.The.Complexity.and.Challenges.of.Software.Engineering.and.Software.Quality.in.t.....torrent'));
var link=url.parse(torrent.announce.toString('utf8'));
var size=torrent.info.length;
var infoHash=encodeURI(torrentParser.infoHash(torrent).toString('hex'));

var uri=torrent.announce.toString('utf8').slice(7);

var query=querystring.stringify({
  //peer_id:'ABCDEFGHIJKLMNOPQRST',
  info_hash:infoHash,
  port:6881,
  uploaded:0,
  downloaded:0,
  left:size,
  event:'started',
  compact:1
});

const options={
  host:link.hostname,
  port:link.port,
  path:link.path+'?'+query,
}

console.log(url.format(options));

console.log(options);



var x=http.get(options, (resp) => {

  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {

    console.log(chunk);
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    console.log(data);
    console.log(resp.statusCode);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

x.end();
