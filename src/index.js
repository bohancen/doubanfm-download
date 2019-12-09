const fs = require('fs')
const path = require('path')
const request = require('request')

// promiseWrap
const promiseWrap = promise => {
  return promise
    .then(data => [null, data])
    .catch(err => [err, null])
}


// 获取个人信息 收藏歌曲
function getUserInfo(cookie){
  return promiseWrap(new Promise((r,j)=>{
    request({
      method:'get',
      url:'https://fm.douban.com/j/v2/redheart/basic',
      headers:{
        cookie
      }
    },(error, response, body)=>{
      let songs = null
      if(error){
        return j(error)
      }
      try{
        songs = JSON.parse(body).songs
      }catch(e){}
      if(songs === null){
        return j('未找到songs字段')
      }
      r(songs)
    })
  }))
}

// 用 sogns的 sid: "551194" 批量获取歌曲信息 return arr
function getIdsInfo(cookie,arryIds){
  // console.log(getIdsInfo)
  let sids = arryIds.join('|')
  return promiseWrap(new Promise((resolve,reject)=>{
    request({
      method:'post',
      url:'https://fm.douban.com/j/v2/redheart/songs',
      headers:{
        cookie
      },
      formData:{
        sids,
        kbps:192,
        ck:'kqCo'
      }
    },(error, response, body)=>{
      if(error){
        // console.log(error)
        reject(error)
        return 
      }
      try{
        body = JSON.parse(body)
      }catch(e){}
      resolve(body)
    })
  }))
}

// 获取每一首歌曲的详细信息
async function getEverySongsInfo(cookie,arrSongs){
  // 拆分成30一组结构
  let objSongsId = arrSongs.reduce((pre,{sid},index)=>{
    let keyName = 'key-' + parseInt((index+1)/30,10)
    if(!pre[keyName]){
      pre[keyName] = []
    }
    pre[keyName].push(sid)
    return pre
  },{})

  // 封装 Promise 数组
  let arrPromise = Object.keys(objSongsId).reduce((pre,key)=>{
    pre.push(getIdsInfo(cookie,objSongsId[key]))
    return pre
  },[])
  
  return new Promise((resolve,reject)=>{
    // 获取全部sid的详细信息
    Promise.all(arrPromise)
    .then(arr=>{
      // 合成一个大数组
      let r = arr.reduce((pre,cur)=>{
        pre = [...pre,...JSON.parse(cur)]
        return pre
      },[])
      resolve([null,r])
    })
    .catch(e=>{
      reject([e,null])
    })
  })

}

// 获取json
function getJsonFile(pathName){
  // fs.Dirent.isFile(pathName)
  let res = null
  try{
    res = JSON.parse(fs.readFileSync(pathName, 'utf8'))
  }catch(e){}
  // if(res === null){}
  return res
}

function mkdir(pathDir){
  return new Promise((r,j)=>{
      fs.stat(pathDir,(err,stats)=>{
          if(err || stats.isDirectory() === false){
              fs.mkdir(pathDir, { recursive: true }, (err) => {
                  if (err) {
                      return j([err,null])
                  }
                  r([null,true])
              })
              return
          }
          r([null,true])
      })
  })
}

async function task(arrTask,fn,pre){
  let index = 0
  let maxIndex = arrTask.length
  let innerTask = async function(){
    if(index>=maxIndex){
      return pre
    }
    console.log(`进度:${index}/${maxIndex}`)
    let [err,data] = await arrTask[index]()
    pre = fn(pre,[err,data])
    index+=1
    return await innerTask()
  }
  return await innerTask()
}

module.exports={
  getUserInfo,
  getIdsInfo,
  getEverySongsInfo,
  getJsonFile,
  mkdir,
  task
}