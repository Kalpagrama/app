import { apolloProvider } from 'boot/apollo'
import { fragments } from 'schema/index'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

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

  // let nodeFull = {
  //   layout: 'PIP', // "PIP", "SLIDER", "VERTICAL", "HORIZONTAL"
  //   name: '',
  //   fragments: [
  //     {
  //       name: '',
  //       thumbUrl: '',
  //       scale: 1000,
  //       cuts: [
  //         {
  //           name: '',
  //           color: '', // cutCreate () => {color: $randomColor(Date.now().toString())}
  //           thumbUrl: '',
  //           points: [{ x: 0 }, { x: 20, y: null }],
  //           style: null
  //         }
  //       ]
  //     }
  //   ],
  //   content: {}
  // }

  // checks
  {
    assert.ok(node.categories.length >= 0)
    assert.ok(node.spheres.length >= 0)
    assert.ok(node.fragments.length >= 0)
    assert.ok(['PIP', 'SLIDER', 'VERTICAL', 'HORIZONTAL'].includes(node.layout))
    assert.ok(node.content)
    for (let fr of node.fragments) {
      assert.ok(fr.cuts.length >= 0)
      assert.ok(fr.scale > 0)
      for (let c of fr.cuts) {
        assert.ok(c.color)
        assert.ok(c.thumbUrl)
        assert.ok(c.points && c.points.length === 2)
        let start = c.points[0].x
        let end = c.points[1].x
        assert.ok(start >= 0 && end > 0)
        assert.ok(end > start && end <= fr.scale)
      }
    }
  }

  let nodeInput = {}
  nodeInput.layout = node.layout
  nodeInput.name = node.name
  nodeInput.categories = node.categories
  nodeInput.spheres = node.spheres
  nodeInput.fragments = node.fragments.map((f, fi) => {
    return {
      oid: f.content.oid,
      name: f.name,
      thumbUrl: f.thumbUrl,
      relativeScale: f.scale,
      relativePoints: f.cuts.reduce((acc, c) => {
        acc.push(...c.points)
        return acc
      }, [])
    }
  })
  nodeInput.meta = {
    layout: node.layout,
    fragments: node.fragments.map((f, fi) => {
      return {
        thumbUrl: f.thumbUrl,
        relativeCuts: f.cuts
      }
    })
  }

  for (let fr of node.fragments){
    fr.oid = fr.content.oid
    delete fr.content
  }
  logD('wsNodeSave nodeInput', node)
  let res
  if (node.oid) {
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
        oid: node.oid, node
      }
    })
    res = wsNodeUpdate
  } else {
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
        oid: node.oid, node
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
