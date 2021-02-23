import Cookies from 'js-cookie'

const app = {
  state: {
    sidebar: {
      opened: +Cookies.get('sidebarStatus') == NaN ? true : false,
      withoutAnimation: false
    },
    device: 'desktop'
  },
  mutations: {
    TOGGLE_SIDEBAR: state => {
      if (!state.sidebar.opened) {
        Cookies.set('sidebarStatus', true)
      } else {
        Cookies.set('sidebarStatus', false)
      }
      state.sidebar.opened = !state.sidebar.opened
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('sidebarStatus', true)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    }
  },
  actions: {
    ToggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    },
    CloseSideBar ({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    ToggleDevice ({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    }
  }
}

export default app
