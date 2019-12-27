import assert from 'assert'

import { apolloProvider } from 'boot/apollo'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)
// todo переместить текущего пользователя в objects
export const init = async (context) => {
  if (context.state.initialized) return
  context.commit('init', context.rootState.objects.currentUser)
  return true
}

export const setFavouriteCategories = async (context, categoryTypes) => {
  // logD('', categoryTypes)
  let { data: { setFavouriteCategories } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation sw_network_only_setFavouriteCategories ($categories: [CategoryEnum!]!){
        setFavouriteCategories(categories: $categories)
      }
    `,
    variables: {
      categories: categoryTypes
    }
  })
  return setFavouriteCategories
}
