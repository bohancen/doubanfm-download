const inquirer = require('inquirer')
const fs = require('fs')
const path = require('path')
const {getUserInfo,getIdsInfo,getJsonFile,mkdir,task} = require('./src/index')

;(async()=>{
  await mkdir(path.resolve(__dirname,'./catch'))
  let {cookie} = await inquirer.prompt([
    {
      type: 'input',
      name: 'cookie',
      message: '输入cookie:',
    }
  ])
  if(!cookie){
    return console.log('cookie不正确，不能为空')
  }
  // 获取收藏歌曲列表
  let [err,arrSongs] = await getUserInfo(cookie)
  if(err){
    throw new Error(err)
  }
  if(arrSongs.length === 0){
    throw new Error('没有收藏任何歌曲')
  }
  // 提出所有sid ,整理为一个arr 并保存arrSid
  let arrSid = arrSongs.reduce((pre,{sid})=>{
    pre.push(sid)
    return pre
  },[])
  fs.writeFileSync(path.resolve(__dirname,'./catch/arrSid.json'),JSON.stringify(arrSid))

  console.log(`发现你有${arrSongs.length}首收藏歌曲`)
  console.log(`获取所有歌曲详细信息中...稍等`)
  
  // 拆分成30一组结构
  let objSongsId = arrSongs.reduce((pre,{sid},index)=>{
    let keyName = 'key-' + parseInt((index+1)/30,10)
    if(!pre[keyName]){
      pre[keyName] = []
    }
    pre[keyName].push(sid)
    return pre
  },{})

  // 生成队列函数 数组
  let arrTask = Object.keys(objSongsId).reduce((pre,key)=>{
    let arrSongs = objSongsId[key]
    pre.push(getIdsInfo.bind(null,cookie,arrSongs))
    return pre
  },[])

  // 每首收藏歌曲详细信息 打包成arr 并写入 arrSidInfo.json文件
  let arrSidInfo = await task(arrTask,function(pre,[err,data]){
    if(data){
      pre = [...pre,...data]
    }
    return pre
  },[])
  fs.writeFileSync(path.resolve(__dirname,'./catch/arrSidInfo.json'),JSON.stringify(arrSidInfo))
  // 生成下载列表
  let downLoadStr = arrSidInfo.reduce((pre,{url})=>{
    pre+=`${url}\n`
    return pre
  },'')
  fs.writeFileSync(path.resolve(__dirname,'./catch/downLoad.txt'),downLoadStr)
  console.log('生成下载列表成功')
})();