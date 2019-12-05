const inquirer = require('inquirer')
const fs = require('fs')
const path = require('path')
const {getUserInfo,getEverySongsInfo,getJsonFile} = require('./src/index')

;(async function(){
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

  // 第一步：获取收藏列表ids
  console.log('获取{sid}获取收藏{songs}列表')
  let err0,data = null
  data = getJsonFile(path.resolve(__dirname,'./catch/userinfo.json'))
  if(data === null){
    [err0,data] = await getUserInfo(cookie)
    if(err0){
      throw new Error(err)
    }
    if(!data.songs){
      throw new Error('没有找到歌曲songs列表')
    }
  
    console.log('写入./catch/userinfo.json')
    fs.writeFileSync(path.resolve(__dirname,'./catch/userinfo.json'),JSON.stringify(data))
  }

  // 第二步
  console.log('获取{sid}获取歌曲详细列')
  let err1,allSongsInfo = null
  allSongsInfo = getJsonFile(path.resolve(__dirname,'./catch/allSongsInfo.json'))
  if(allSongsInfo === null){
    [err1,allSongsInfo] = await getEverySongsInfo(cookie,data.songs)
    if(err1){
      throw new Error(err)
    }
    console.log('写入./catch/allSongsInfo.json')
    fs.writeFileSync(path.resolve(__dirname,'./catch/allSongsInfo.json'),JSON.stringify(allSongsInfo))
  }

  // 第三步
  console.log('生成下载download.txt 下载列表')
  let downloadList = allSongsInfo.reduce((pre,cur)=>{
    if(cur.url){
      pre.push(cur.url)
    }
    return pre
  },[]).join('\n')
  fs.writeFileSync(path.resolve(__dirname,'./catch/download.txt'),downloadList)
})();