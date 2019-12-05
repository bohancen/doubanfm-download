const fs = require('fs')
const path = require('path')
const request = require('request')


// 获取个人信息 收藏歌曲
function getUserInfo(cookie){
  console.log('getUserInfo')
  return new Promise((r,j)=>{
    request({
      method:'get',
      url:'https://fm.douban.com/j/v2/redheart/basic',
      headers:{
        cookie
      }
    },(error, response, body)=>{
      if(error){
        j([error,null])
        return
      }
      try{body = JSON.parse(body)}catch(e){}
      r([null,body])
    })
  })
}

// 用 sogns的 sid: "551194" 批量获取歌曲信息
function getIdsInfo(cookie,arryIds){
  console.log(getIdsInfo)
  let sids = arryIds.join('|')
  return new Promise((resolve,reject)=>{
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
      resolve(body)
      // console.log('success')
      try{
        // console.log(JSON.parse(body))
      }catch(e){}
    })
  })
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
  if(res === null){}
  return res
}

module.exports={
  getUserInfo,
  getEverySongsInfo,
  getJsonFile,
}