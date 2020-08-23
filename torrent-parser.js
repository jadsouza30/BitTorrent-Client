const fs=require('fs');
const bencode=require('bencode');
const crypto=require('crypto');
const bignum=require('bignum');

module.exports.open = (filepath) => {
  return bencode.decode(fs.readFileSync(filepath));
};

module.exports.infoHash=torrent=>{
  const info=bencode.encode(torrent.info);
  return crypto.createHash('sha1').update(info).digest();
};

module.exports.size=torrent=>{
  var size;

  if(torrent.info.files){
    sizetorrent.info.files.map(file => file.length).reduce((a, b) => a + b);
  }
  else{
    size=torrent.info.length;
  }

  return bignum.toBuffer(size,{size:8});
};


module.exports.respType=(resp)=>{
  const code = resp.readUInt32BE(0);
  if(code==0) return 'connect';
  return 'announce';
};
