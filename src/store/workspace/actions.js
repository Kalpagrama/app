import { apolloProvider } from 'boot/apollo'
import { fragments } from 'schema/index'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

export const init = async (context) => {
  // if (context.state.initialized) throw new Error('events state initialized already')
  if (context.state.initialized) return
  logD('userWorkspace init. userWorkspace=', context.rootState.objects.currentUser.workspace)
  context.commit('init', context.rootState.objects.currentUser.workspace)
  return true
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
export const wsNodeSave = async (context, node) => {
  logD('wsNodeSave start', node)
  // checks
  {
    assert.ok(node.categories.length >= 0)
    assert.ok(node.spheres.length >= 0)
    assert.ok(node.fragments.length >= 0)
    assert.ok(node.meta.layout)
    for (let fr of node.fragments) {
      // assert.ok(fr.relativeCuts.length >= 0)
      // for (let rc of fr.relativeCuts) {
      //   assert.ok(fr.relativeScale > 0 && rc.start >= 0 && rc.end > 0)
      //   assert.ok(rc.end > rc.start && rc.end <= fr.relativeScale)
      // }
    }
    for (let fr of node.meta.fragments) {
      assert.ok(fr.relativeCuts.length >= 0)
    }
  }
  node.fragments.map((f, fi) => {
    delete f.content
    f.relativePoints = node.meta.fragments[fi].relativeCuts.reduce((acc, val) => {
      acc.push({x: val.start})
      acc.push({x: val.end})
      return acc
    }, [])
  })
  let res
  logD('wsNodeSave before', node)
  if (node.oid) {
    delete node.oid
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
        node: node
      }
    })
    res = wsNodeUpdate
  } else {
    delete node.oid
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
        node: node
      }
    })
    res = wsNodeCreate
  }
  logD('wsNodeSave done', res)
  return res
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
