const start = new Date().getTime()
let param = getQueryVariable('uuid')
// param = 'fc53297c-c7e7-42b9-b026-f02d0883949'
console.log(param)
if (param === undefined) {
  openUrl('https://www.baidu.com')
}

var ua = navigator.userAgent.toLowerCase()
var isTk = ua.indexOf('bytefulllocale') != -1
var isStartBrowser = false
var isTwoTo = false
let url = window.location.href
if (param.indexOf('to5vUrl') != -1) {
  isTwoTo = true
  param = param.split('to5vUrl')[0]
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

if (param.indexOf('http') == 0) {
  let toUrl = decodeURIComponent(param)
  openUrl(toUrl)
} else {
  openAppReq()
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
      console.log('数据返回成功', ajaxObj.response)
      let val = ajaxObj.responseText
      const value = JSON.parse(val)
      console.log('接口访问耗时', new Date().getTime() - startApi + 'ms')

      if (value.length <= 0) {
        openUrl('https://tiktoktl.com?message=网络不好!')
        return
      }

      // if (value.result != null && value.result.isStartBrowser) {
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

function toAppUrl(value) {
  if (value === undefined || value == null) {
    openUrl('https://tiktoktl.com?message=未知跳转')
    return
  }
  let lastTime = 0
  let i = 0
  let start = function openURLS(urls, callback) {
    let waitTime = 30
    if (i === 0) {
      waitTime = 0
    }
    setTimeout(function () {
      open(urls[i])
      i++
      if (i < urls.length) {
        callback(urls, callback)
      }
    }, waitTime)
  }
  start(value, start)
  lastTime = value.length * 30
  // }
  window.setTimeout(function () {
    console.log(
      '最后打开',
      toMainUrl + ',耗时：' + (new Date().getTime() - start) + ' ms',
    )
    openUrl(toMainUrl)
  }, lastTime)
}

function getDataByCountry(list, country) {
  let data = []
  list.forEach((item) => {
    if (item.country == country) {
      data.push(item)
    }
  })
  if (data.length <= 0) {
    list.forEach((item) => {
      if (item.country == '无') {
        data.push(item)
      }
    })
  }

  if (data.length <= 0) {
    return
  }
  const size = data.length
  return data[Math.floor(Math.random() * size)]
}
function open(urlitem) {
  switch (urlitem.type) {
    case 1:
      //跳转url
      openUrl(urlitem.origin_url)
      break
    case 3:
      //whatsapp
      const { msg, to } = urlitem.origin_url
      window.location.href = `${urlitem.tip}?msg=${msg}&to=${to}`
      break
    case 8:
      // google chrome
      checkUrl(urlitem.origin_url)
      if (ua.includes('chrome')) {
        openUrl(urlitem.origin_url)
      }
      if (ua.includes('android')) {
        window.location.href = `googlechrome://navigate?url=${urlitem.origin_url}`
      } else {
        const url = urlitem.origin_url.replace(/^http?:\/\//, 'googlechrome://')
        window.location.href = url
      }
      break
    case 9:
      // firefox
      checkUrl(urlitem.origin_url)
      if (ua.includes('firefox')) {
        openUrl(urlitem.origin_url)
      }
      if (ua.includes('android')) {
        window.location.href = `fenix://open?url=${urlitem.origin_url}`
      } else {
        window.location.href = `firefox://open-url?url=${urlitem.origin_url}`
      }
      break
    default:
      var url = urlitem.tip + urlitem.origin_url
      if (url === undefined || url === null || url.indexOf('://') === -1) {
        url =
          'https://tiktoktl.com?message=您的跳转URL有误:' +
          decodeURIComponent(url)
      }
      console.log('打开', url)
      window.location.href = url
      setTimeout(function () {
        window.location = url
      }, 20)
      break
  }
}

function openUrl(url) {
  if (
    url === undefined ||
    url === null ||
    (url.indexOf('http://') === -1 && url.indexOf('https://') === -1)
  ) {
    url = 'https://tiktoktl.com?msg=' + decodeURIComponent(url)
  }
  window.location.href = url
  setTimeout(function () {
    window.location = url
  }, 20)
}

function checkUrl(url) {
  if (url === undefined || url === null || !/^http:\/\//.test(url)) {
    window.location.href = 'https://tiktoktl.com?msg=' + decodeURIComponent(url)
  }
}
