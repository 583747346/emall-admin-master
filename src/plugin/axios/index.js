import axios from 'axios'
import util from '@/libs/util'
import { Message } from 'element-ui'
import router from '@/router'

// 创建一个 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  withCredentials: true, // 跨域请求，允许保存cookie
  timeout: 30000 // 请求超时时间
})

// HTTPrequest拦截
service.interceptors.request.use(config => {

  console.log(config)
  if (window.sessionStorage.getItem('token')) {
    config.headers['Authorization'] = 'Bearer ' + window.sessionStorage.getItem('token')
  }
  return config
}, error => {
  return Promise.reject(error)
})

const errorHandle = (status, other) => {
  var errMsg
  // 状态码判断
  switch (status) {
    case 400:
      errMsg = '错误请求, 请检查请求参数'
      break
    case 401:
      errMsg = '无效的Token'
      util.cookies.remove('token')
      util.cookies.remove('uuid')

      router.push({
        name: 'login'
      })
      break
    case 403:
      errMsg = '当前操作没有权限'
      break
    case 404:
      errMsg = '未找到该资源'
      break
    case 405:
      errMsg = '请求方法未允许'
      break
    case 408:
      errMsg = '请求超时'
      break
    case 478:
      errMsg = '验证码错误,请重新输入'
      break
    case 479:
      errMsg = '演示环境，没有权限操作'
      break
    case 500:
      errMsg = '服务器端出错'
      break
    case 501:
      errMsg = '网络未实现'
      break
    case 502:
      errMsg = '网络错误'
      break
    case 503:
      errMsg = '服务不可用'
      break
    case 504:
      errMsg = '网络超时'
      break
    case 505:
      errMsg = 'http版本不支持该请求'
      break
    default:
      errMsg = '系统未知错误,请反馈给管理员'
      break
  }
  return errMsg
}

// HTTPresponse拦截
service.interceptors.response.use(
  res => res.status === 200 ? Promise.resolve(res) : Promise.reject(res),
  error => {
    let errMsg
    const { response } = error
    if (response) {
      // 请求错误
      errMsg = errorHandle(response.status, response.data.message)

    } else if (error.request) {
      if (error.message.includes('timeout')) {
        tip('timeout')
        errMsg = '请求超时'
      } else {
        if (error.request.readyState == 4 && error.request.status == 0) {
          //errMsg = error.request.readyState +'|'+ error.request.status;
          errMsg = '接口没有响应，或为登陆过期，请重新登陆或联系管理员'
          util.cookies.remove('token')
          util.cookies.remove('uuid')
          /*
           *清空db中用户数据
           *
           * - - -
           **/
          router.push({
            name: 'login'
          })
        }
      }
    } else {
      errMsg = error.message
    }

    let resMsg = ''
    if (response && response.data) {
      if (response.data.resp_msg) {
        resMsg = response.data.resp_msg
      } else if (response.data.message) {
        resMsg = response.data.message
      } else if (response.data.msg) {
        resMsg = response.data.msg
      } else if (response.data.errMsg) {
        resMsg = response.data.errMsg
      }
    }
    Message({
      message: resMsg || errMsg,
      type: 'error'
    })
    let msg = resMsg || errMsg
    return Promise.reject({
      res: response,
      msg
    })
  })
export default service
