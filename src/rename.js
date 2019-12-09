const fs = require('fs')
const path = require('path')
const {getJsonFile} = require('./index')

let data = getJsonFile(path.resolve(__dirname,'../catch/arrSidInfo.json')) || []
console.log(data)

function adiFindItem(sid){
  for(item of data){
    if(sid == item.sid){
      return item
    }
  }
}

function rename(){
  let musicList = fs.readdirSync(path.resolve(__dirname,'./music'))
  // 去除多余后缀
  // musicList.forEach((fileName)=>{
  //   // console.log(fileName)
  //   if(fileName.indexOf('.mp3.mp3')>-1){
  //     let newPath = path.resolve(__dirname,'./music/',fileName.replace('.mp3.mp3','.mp3'))
  //     let oldPath = path.resolve(__dirname,'./music/',fileName)
  //     fs.rename(oldPath, newPath, (err) => {
  //       if (err) throw err;
  //       // console.log('重命名完成');
  //     });
  //   }
  // })
  musicList.forEach((fileName,index)=>{
    // if(index >0){return}
    let sid = undefined
    try{sid = fileName.match(/p([0-9]+)_/)[1]}catch(e){}
    if(!sid){return}
    // console.log(sid)
    let info = adiFindItem(sid)
    if(!info){return}
    // console.log(info.title)
    // console.log(info.artist)
    // console.log(info.albumtitle)
    // 歌手名-歌曲名-专辑名-sid
    // console.log(fileName)
    let newName = `${info.artist}-${info.title}-${info.albumtitle}-${sid}.mp3`.replace(/\//g,'+')
    let newPath = path.resolve(__dirname,'./music/',newName)
    let oldPath = path.resolve(__dirname,'./music/',fileName)
    fs.rename(oldPath, newPath, (err) => {
      if (err){
        console.log(fileName)
        console.log(err)
      }
      // console.log('重命名完成');
    });
  })
}

