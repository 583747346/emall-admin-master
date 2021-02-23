import AjaxFn from '@/plugin/api'

const user = {
  state: {
    userInfo: null,
  },

  mutations: {
    SET_USER_INFO: (state, object) => {
      state.userInfo = object
    }
  },
  actions: {
    // 获取用户信息
    getUserInfo ({ commit, state, dispatch }) {
      return new Promise(async resolve => {
        if (state.userInfo) {
          resolve(state.userInfo)
        } else {
          let ajaxFn = new AjaxFn(this)
          ajaxFn.get({
            url: '/emall-manageplat/user/getUserInfo'
          }).then(res => {
            let { data, status } = res
            if (status === 200) {
              if (ajaxFn.respIsTrue(data)) {
                commit('SET_USER_INFO', data.data)
                resolve(data.data)
              }
            }
          })
        }
      })
    }
  }
}

export default user
