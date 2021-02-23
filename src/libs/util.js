import cookies from './util.cookies'

const util = {
  cookies
}

/**
 * 初始化顶部菜单
 * @param {用户菜单} menu
 */
util.initHeaderMenu = function (menu) {
  return getMenu(menu)
}

/**
 * 生成随机len位数字
 */
util.randomLenNum = function (len, date) {
  let random = ''
  random = Math.ceil(Math.random() * 100000000000000).toString().substr(0, typeof len === 'number' ? len : 4)
  if (date) random = random + Date.now()
  return random
}

/**
 * @description 更新标题
 * @param {String} title 标题
 */
util.title = function (titleText) {
  const processTitle = process.env.VUE_APP_TITLE || 'D2Admin'
  window.document.title = `${processTitle}${titleText ? ` | ${titleText}` : ''}`
}

export default util
