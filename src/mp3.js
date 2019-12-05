// 更改封面信息

const NodeID3 = require('node-id3')

let file = './downloadFile/music.mp3'
let filebuffer = new Buffer("Some Buffer of a (mp3) file")
let filepath = './path/to/(mp3)file'

let tags = {
  title: "title",
  artist: "artist",
  APIC: "./downloadFile/pic.jpg",
}

// let ID3FrameBuffer = NodeID3.create(tags)

// let success = NodeID3.update(tags, file) //  Returns true/false or, if buffer passed as file, the tagged buffer
NodeID3.update(tags, file, function(err, buffer) {
  if(err){
    console.log(err)
  }
  console.log('success')
})