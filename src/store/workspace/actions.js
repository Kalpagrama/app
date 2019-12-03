import { apolloProvider } from 'boot/apollo'
import { fragments } from 'schema/index'
import { logD } from 'src/boot/log'
import assert from 'assert'

export const init = async (context, userWorkspace) => {
  // if (context.state.initialized) throw new Error('events state initialized already')
  if (context.state.initialized) return
  logD('userWorkspace init. userWorkspace=', userWorkspace)
  context.commit('init', userWorkspace)
  return userWorkspace
}

// работа с мастерской идет через эвенты. Мутация на сервере вызывает эвент, котрый отлавливается в модуле events
export const wsSphereCreate = async (context, sphere) => {
  logD('wsSphereCreate start', sphere)
  let { data: { wsSphereCreate } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      ${fragments.objectShortFragment}
      mutation wsSphereCreate ($sphere: ObjectShortInput!) {
        wsSphereCreate (sphere: $sphere) {
          ...objectShortFragment
        }
      }
    `,
    variables: {
      sphere
    }
  })
  // context.commit('wsSphereCreate', wsSphereCreate)
  logD('wsSphereCreate done', wsSphereCreate)
  return wsSphereCreate
}
export const wsSphereDelete = async (context, oid) => {
  logD('wsSphereDelete start', oid)
  let { data: { wsSphereDelete } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation wsSphereDelete ($oid: OID!) {
        wsSphereDelete (oid: $oid)
      }
    `,
    variables: {
      oid
    }
  })
  // context.commit('wsSphereDelete', uid)
  // TODO: delete this tag from all tagUids
  logD('wsSphereDelete done')
  return wsSphereDelete
}
export const wsNodeCreate = async (context, node) => {
  logD('wsNodeCreate start')
  assert.ok(node)
  let { data: { wsNodeCreate } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      ${fragments.nodeFragment}
      mutation wsNodeCreate ($node: NodeInput!) {
        wsNodeCreate (node: $node) {
          ...nodeFragment
        }
      }
    `,
    variables: {
      node
    }
  })
  logD('wsNodeCreate', wsNodeCreate)
  return wsNodeCreate
}
export const wsNodeUpdate = async (context, node) => {
  logD('wsNodeUpdate start')
  assert.ok(node)
  let { data: { wsNodeUpdate } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      ${fragments.nodeFragment}
      mutation wsNodeUpdate ($oid: OID!, $node: NodeInput!) {
        wsNodeUpdate (oid: $oid, node: $node) {
          ...nodeFragment
        }
      }
    `,
    variables: {
      oid: node.oid,
      node
    }
  })
  logD('wsNodeUpdate done', wsNodeUpdate)
  // context.commit('wsNodeUpdate', wsNodeUpdate)
  return wsNodeUpdate
}
export const wsNodeDelete = async (context, oid) => {
  logD('wsNodeDelete start')
  assert.ok(oid)
  let { data: { wsNodeDelete } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation wsNodeDelete ($oid: OID!) {
        wsNodeDelete (oid: $oid)
      }
    `,
    variables: {
      oid
    }
  })
  logD('wsNodeDelete done', wsNodeDelete)
  return wsNodeDelete
}
