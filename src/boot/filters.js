
export default async ({ Vue }) => {
  Vue.filter('rate', (value) => {
    if (value <= 0.2) return 'Нет'
    if (value <= 0.4) return 'Скорее нет'
    if (value <= 0.6) return 'Может быть'
    if (value <= 0.8) return 'Скорее да'
    return 'Да'
  })
  Vue.filter('cut', function (text, length) {
    let add = text.length > length ? '...' : ''
    return text.slice(0, length) + add
  })
}
