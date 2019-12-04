import assert from 'assert'

import { apolloProvider } from 'boot/apollo'

export const init = async (context, user) => {
  if (context.state.initialized) return
  context.commit('init', user)
  return true
}

// path ex: ['settings', 'general', 'language'] OR ['profile', 'gender']
export const setUserValue = async (context, {path, value}) => {
  let { data: { objectChange } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation objectChange ($oid: OID!, $path: [String!]!, $value: RawJSON!) {
        objectChange (oid: $oid, path: $path, value: $value)
      }
    `,
    variables: {
      oid: context.state.user.oid,
      path,
      value
    }
  })
  return objectChange
}
