const fs = require('fs')
const path = require('path')
const request = require('request')
const log = require('single-line-log').stdout;

// 下载歌曲 暂时不用 用迅雷替代 然后使用rename重命名
function download({url,title,file_ext}){

  return new Promise((resolve,reject)=>{  
    let contentLength = 1
    let acceptLength = 0
    let writeStream = fs.createWriteStream(`./downloadFile/${title}.${file_ext}`)
    let httpStream = request({
      url,
      method: 'GET',
      headers:{
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
      }
    },function(error, response, body){
      if(error){
        console.log(error)
        reject({url,title,file_ext})
      }
    })
    // 联接Readable和Writable
    httpStream.pipe(writeStream)
    writeStream.on('close', () => {
      console.log('recevied finished')
      resolve()
    })
    // 当获取到第一个HTTP请求的响应获取
    httpStream.on('response', (response) => {
      contentLength = response.headers['content-length']
    })

    // 统计进度
    httpStream.on('data', (chunk) => {
      acceptLength += chunk.length
      log(`${title}:进度`,parseInt(acceptLength/contentLength*100,10),'%')
    })
  })
}
// download({url:'http://mr3.doubanio.com/f850b298beb1cf6920582af7a31c19c0/0/fm/song/p2051605_128k.mp3',title:'hahaha'})