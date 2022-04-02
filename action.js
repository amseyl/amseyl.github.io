const urlRegex = /^https?:\/\//
const start = new Date().getTime()
let param = getQueryVariable('uuid')
// param = '803d08ff-0d43-4b6b-b34e-990d5aa01825'
if (param === undefined) {
  openUrl('https://www.baidu.com')
}

const ua = navigator.userAgent.toLowerCase()
let isTk = ua.indexOf('bytefulllocale') !== -1
let isStartBrowser = false
let isTwoTo = false
let url = window.location.href
if (param.indexOf('to5vUrl') !== -1) {
  isTwoTo = true
  param = param.split('to5vUrl')[0]
}

if (urlRegex.test(param)) {
  const toUrl = decodeURIComponent(param)
  openUrl(toUrl)
} else {
  openAppReq()
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1)
  var vars = query.split('&')
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')
    if (pair[0] == variable) {
      return pair[1]
    }
  }
  return
}

function toMainUrl(msg) {
  window.location.href = 'https://tiktoktl.com?msg=' + decodeURIComponent(msg)
}

function openUrl(url) {
  logger('open', url)
  if (url && urlRegex.test(url)) {
    window.location.href = url
  } else {
    toMainUrl(url)
  }
}

function getgeoip(json) {
  window.country = json.country_code
  console.log('country', window.country)
}

function openAppReq() {
  const ajaxObj = new XMLHttpRequest()
  const startApi = new Date().getTime()
  ajaxObj.open(
    'get',
    'https://scapi.tiktoktl.com/api/v1/short_chain/public/targets/?short_chain_uuid=' +
      param,
  )
  ajaxObj.setRequestHeader('content-type', 'application/json')
  ajaxObj.onreadystatechange = function () {
    if (ajaxObj.readyState == 4 && ajaxObj.status == 200) {
      // console.log('数据返回成功', ajaxObj.response)
      let val = ajaxObj.responseText
      const value = JSON.parse(val)
      // console.log('接口访问耗时', new Date().getTime() - startApi + 'ms')

      if (value.length <= 0) {
        toMainUrl('网络不好！')
        return
      }

      // if (value.result !== null && value.result.isStartBrowser) {
      isStartBrowser = false
      // }
      if (isStartBrowser && isTk && !isTwoTo) {
        url = url + 'to5vUrl'
        $(document).ready(function () {
          location.href =
            'snssdk1233://webview?hide_nav_bar=0&hide_more=0&url=https%3A%2F%2Fwww.tiktok.com%2Flink%2Fv2%3Faid%3D1180%26lang%3Den%26scene%3Dbio_url%26target%3D' +
            encodeURIComponent(url) +
            '%26flag%3D%252Fwallet%252Fhome%26entry%3Dsettings'
        })
      }
      if (isStartBrowser && isTk && isTwoTo) {
        document.getElementById('cover').style.display = ''
        document.getElementById('main').style.display = 'none'
      }

      if (!isStartBrowser || !isTk) {
        toAppUrl(value.data)
      }
    }
  }
  ajaxObj.send()
}

function toAppUrl(data) {
  if (!data) {
    toMainUrl('未知跳转')
    return
  }
  const sortedData = []
  for (let i = 0; i < data.length; i++) {
    const key = data[i].type
    let sortedItem = sortedData.find((item) => item.type === key)
    if (sortedItem) {
      sortedItem.data.push(data[i])
    } else {
      sortedItem = {
        type: key,
        data: [data[i]],
      }
      sortedData.push(sortedItem)
    }
  }

  console.log(JSON.stringify(sortedData))

  let i = 0
  let action = (rules, callback) => {
    let waitTime = 50
    if (i === 0) {
      waitTime = 0
    }
    setTimeout(() => {
      openRule(rules[i])
      i++
      if (i < rules.length) {
        callback(rules, callback)
      }
    }, waitTime)
  }

  action(sortedData, action)

  const lastTime = sortedData.length * 500
  window.setTimeout(function () {
    console.log('最后打开, 耗时：' + (new Date().getTime() - start) + ' ms')
    toMainUrl('')
  }, lastTime)
}

function openRule(rule) {
  const data = rule.data
  const find = data.find((item) => item.target_country === window.country)
  if (find) {
    open(find)
  } else {
    open(data[0])
  }
}

function open(item) {
  logger(item.type, item.origin_url)
  switch (item.type) {
    case 1:
      //跳转url
      openUrl(item.origin_url)
      break
    case 3:
      //whatsapp
      const { msg, to } = item.origin_url
      window.location.href = `${item.tip}${to}&msg=${msg}`
      break
    case 8:
      // google chrome
      if (ua.includes('chrome')) {
        logger(item.type, 'chrome')
        openUrl(item.origin_url)
      } else if (ua.includes('android')) {
        logger(item.type, 'chrome android')
        window.location.href = `googlechrome://navigate?url=${item.origin_url}`
      } else {
        logger(item.type, 'chrome others')
        const url = item.origin_url.replace(/^http?:\/\//, 'googlechrome://')
        window.location.href = url
      }
      break
    case 9:
      // firefox
      if (ua.includes('firefox')) {
        logger(item.type, 'firefox')
        openUrl(item.origin_url)
      } else if (ua.includes('android')) {
        logger(item.type, 'firefox android')
        window.location.href = `fenix://open?url=${item.origin_url}`
      } else {
        logger(item.type, 'firefox others')
        window.location.href = `firefox://open-url?url=${item.origin_url}`
      }
      break
    default:
      var url = item.tip + item.origin_url
      if (!url || !url.includes('://')) {
        toMainUrl(`您的跳转URL有误: ${decodeURIComponent(url)}`)
        return
      }
      logger('open', url)
      window.location.href = url
      break
  }
}

function logger(type, msg, ...args) {
  console.log('to: ', type, msg, ...args)
}
