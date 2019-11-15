import assert from 'assert'

import { apolloProvider } from 'boot/apollo'

export const init = async (context, user) => {
  if (context.state.initialized) return
  context.commit('init', user)
  return true
}

export const setSettingValue = async (context, path, value) => {
  let { data: { userSettingsSetValue } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation subscribe ($path: [String!]!, $value: RawJSON!) {
        userSettingsSetValue (path: $path, value: $value)
      }
    `,
    variables: {
      path,
      value
    }
  })
  context.commit('setSettingValue', path, value)
}

export const setProfileValue = async (context, path, value) => {
  let { data: { userProfileSetValue } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation subscribe ($path: [String!]!, $value: RawJSON!) {
        userProfileSetValue (path: $path, value: $value)
      }
    `,
    variables: {
      path,
      value
    }
  })
  context.commit('setProfileValue', path, value)
}
