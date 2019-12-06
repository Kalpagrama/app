import { apolloProvider } from 'boot/apollo'
import { fragments } from 'schema/index'
import { logD } from 'src/boot/log'
import assert from 'assert'

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
export const wsNodeCreate = async (context, node) => {
  logD('wsNodeCreate start')

  node = {
    name: 'test name', // любое
    categories: ['POLITICS'], // любое
    spheres: [], // любое
    layout: 'PIP', // PIP, HORIZONTAL, VERTICAL, SLIDER
    // превью ядра
    thumbUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    fragments: [{ // от 1 до 2
      name: 'fragment1 name',
      contentOid: 'AmiFT0MCoGI=',
      thumbUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
      width: 600,
      height: 450,
      color: 'black',
      relativeScale: 1000,
      relativeCuts: [{ // любое число cuts
        start: 100, // 0 - relativeScale
        end: 200, // (start+1) - relativeScale
        name: 'relativeCut1 name',
        type: 'reserved...',
        thumbUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
      }]
    }
    ]
  }

  // checks
  {
    assert.ok(node.categories.length >= 0)
    assert.ok(node.spheres.length >= 0)
    assert.ok(node.fragments.length >= 0)
    assert.ok(node.layout)
    for (let fr of node.fragments) {
      assert.ok(fr.relativeCuts.length >= 0)
      for (let rc of fr.relativeCuts) {
        assert.ok(fr.relativeScale > 0 && rc.start >= 0 && rc.end > 0)
        assert.ok(rc.end > rc.start && rc.end <= fr.relativeScale)
      }
    }
  }

  let nodeInput = {}
  nodeInput.name = node.name
  nodeInput.categories = node.categories
  nodeInput.spheres = node.spheres
  nodeInput.fragments = node.fragments.map(fr => {
    return {
      name: fr.name,
      oid: fr.contentOid,
      thumbUrl: fr.thumbUrl,
      relativeScale: fr.relativeScale,
      relativePoints: fr.relativeCuts.reduce((acc, val) => {
        acc.push({ x: val.start })
        acc.push({ x: val.end })
        return acc
      }, [])
    }
  })
  nodeInput.meta = {
    layout: node.layout,
    thumbUrl: node.thumbUrl,
    fragments: node.fragments.map(fr => ({
      width: fr.width,
      height: fr.height,
      color: fr.color,
      thumbUrl: fr.thumbUrl,
      relativeCuts: fr.relativeCuts
    }))
  }

  logD('wsNodeCreate node', nodeInput)
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
      node: nodeInput
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
