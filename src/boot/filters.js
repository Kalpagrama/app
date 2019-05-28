import { bigNumbers } from 'src/helpers/numbers'

export default async ({ Vue }) => {
  Vue.filter('format', (value) => {
    return bigNumbers(value)
  })
  Vue.filter('rate', (value) => {
    if (value <= 0.2) return 'Нет'
    if (value <= 0.4) return 'Скорее нет'
    if (value <= 0.6) return 'Может быть'
    if (value <= 0.8) return 'Скорее да'
    return 'Да'
  })
}
