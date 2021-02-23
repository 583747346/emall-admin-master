import axios from '@/plugin/axios'
import util from '@/libs/util'
import { Message } from 'element-ui'

class AjaxFn {
  constructor (pageContext) {
    if (pageContext) {
      this.page = pageContext
      this.page.post = this.post.bind(this)
      this.page.get = this.get.bind(this)
      this.page.form = this.form.bind(this)
      this.page.delete = this.delete.bind(this)
      this.page.respIsTrue = this.respIsTrue.bind(this)
    }
  }

  //获取token
  login ({ data }, config) {
    const form = {
      username: data.username,
      password: data.password,
      grant_type: 'password',
      scope: 'read'
    }
    const url = '/authentication-server/oauth/token'
    let promise = new Promise((resolve, reject) => {
      axios.request({
        url: url,
        method: 'post',
        auth: {
          username: 'client', // This is the client_id
          password: 'secret' // This is the client_secret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        params: form
      }).then(res => {
        resolve(res)
      })
    })
    return promise
  }

  post ({ url, data }, config) {
    if (this.page) {
      this.page.loading = true
    }
    let params = data ? data : {}

    let promise = new Promise((resolve, reject) => {
      axios.post(url, params, config).then(res => {
        if (this.page) {
          this.page.loading = false
        }
        resolve(res)
      }).catch(err => {
        if (this.page) {
          this.page.loading = false
        }
        reject(err)
      })
    })

    return promise
  }

  put ({ url, data }, urlData = []) {
    if (this.page) {
      this.page.loading = true
    }
    let params = data ? data : {}

    let urlParams = ''
    if (urlData.length > 0) {
      for (let i in urlData) {
        urlParams += '/' + urlData[i]
      }
    }

    let requestUrl = url + urlParams
    let promise = new Promise((resolve, reject) => {
      axios.put(requestUrl, params).then(res => {
        if (this.page) {
          this.page.loading = false
        }
        resolve(res)
      }).catch(err => {
        if (this.page) {
          this.page.loading = false
        }
        reject(err)
      })
    })

    return promise
  }

  get ({ url, data }) {
    if (this.page) {
      this.page.loading = true
    }
    let params = data ? data : {}
    if (util.cookies.get('token')) {
      params.access_token = util.cookies.get('token')
    }

    let promise = new Promise((resolve, reject) => {
      axios.get(url, { params }).then(res => {
        if (this.page) {
          this.page.loading = false
        }
        resolve(res)
      }).catch(({ res, msg }) => {
        if (this.page) {
          this.page.loading = false
        }
        reject({
          res,
          msg
        })
      })
    })

    return promise
  }

  form (obj, url, exception) {
    if (this.page) {
      this.page.loading = true
    }
    let form = new FormData()
    for (let i in obj.file) {
      let elementId = document.getElementById(obj.file[i].id)
      form.append(obj.file[i].name, elementId.files[0])
    }
    if (obj.param) {
      for (let i in obj.param) {
        form.append(i, obj.param[i])
      }
    }
    let config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    let axiosUrl = url

    let promise = new Promise((resolve, reject) => {
      axios.post(axiosUrl, form, config).then(res => {
        if (this.page) {
          this.page.loading = false
        }
        resolve(res)
      }).catch(err => {
        if (this.page) {
          this.page.loading = false
        }
        reject(err)
      })
    })

    return promise
  }

  delete ({ url, config }, urlData = []) {
    if (this.page) {
      this.page.loading = true
    }

    let urlParams = ''
    if (urlData.length > 0) {
      for (let i in urlData) {
        urlParams += '/' + urlData[i]
      }
    }

    let requestUrl = url + urlParams

    let promise = new Promise((resolve, reject) => {
      axios.delete(requestUrl, config ? config : {}).then(res => {
        if (this.page) {
          this.page.loading = false
        }
        resolve(res)
      }).catch(err => {
        if (this.page) {
          this.page.loading = false
        }
        reject(err)
      })
    })

    return promise
  }

  respIsTrue (data) {
    let isTrue = true
    if (data.code != 200) {
      Message({
        message: data.mesg,
        type: 'error'
      })
      isTrue = false
    }
    return isTrue
  }
}

export default AjaxFn
