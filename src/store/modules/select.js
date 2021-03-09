const select = {
  state: {
    menu: {
      data: null,
      searchData: null,
      requestUrl: 'emall-ums-service/menu/menulist',
      placeholder: '请选择菜单',
      method: 'post'
    },
    role: {
      data: null,
      searchData: null,
      requestUrl: 'emall-ums-service/role/rolelist',
      placeholder: '请选择角色',
      method: 'post'
    },
    resource: {
      data: null,
      searchData: null,
      requestUrl: 'emall-ums-service/resource/resourcelist',
      placeholder: '请选择资源',
      method: 'post'
    }
  },
  mutations: {
    SET_SELECT_DATA (state, obj) {
      state[obj.target].data = obj.data;
      state[obj.target].searchData = obj.searchData;
    }
  },
  actions: {
    setSelectData({ state, commit, dispatch }, obj){
      return new Promise(async resolve => {
        commit('SET_SELECT_DATA', obj);
      })
    }
  }
};

export default select;
