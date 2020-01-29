import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema/index'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

export const init = async (context) => {
  // if (context.state.initialized) throw new Error('events state initialized already')
  if (context.state.initialized) return
  logD('userWorkspace init')
  context.commit('init')
  return true
}
export const wsClear = async (context) => {
  logD('wsClear start')
  let { data: { wsClear } } = await apollo.clients.api.mutate({
    mutation: gql`
      mutation sw_network_only_wsClear {
        wsClear
      }
    `
  })
  logD('wsClear done', wsClear)
  return wsClear
}
// работа с мастерской идет через эвенты. Мутация на сервере вызывает эвент, котрый отлавливается в модуле events
export const wsSphereCreate = async (context, sphere) => {
  logD('wsSphereCreate start', sphere)
  let { data: { wsSphereCreate } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.wsItemFragment}
      mutation sw_network_only_wsSphereCreate ($sphere: ObjectShortInput!) {
        wsSphereCreate (sphere: $sphere) {
          ...wsItemFragment
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

export const wsItemAdd = async (context, oid) => {
  logD('wsItemAdd start', oid)
  let { data: { wsItemAdd: wsItem } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.wsItemFragment}
      mutation sw_network_only_wsItemAdd ($oid: OID!) {
        wsItemAdd (oid: $oid) {
          ...wsItemFragment
        }
      }
    `,
    variables: {
      oid
    }
  })
  // context.commit('wsSphereCreate', wsSphereCreate)
  logD('wsItemAdd done', wsItem)
  return wsItem
}
export const wsContentCreate = async (context, {type, url, spheres}) => {
  logD('wsContentCreate start', url)
  let { data: { wsContentCreate } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.wsItemFragment}
      mutation sw_network_only_wsContentCreate ($type: ObjectTypeEnum, $url: String, $spheres: [ObjectShortInput!]!) {
        wsContentCreate (content: {type: $type, url: $url, spheres: $spheres}) {
          ...wsItemFragment
        }
      }
    `,
    variables: {
      type, url, spheres
    }
  })
  logD('wsContentCreate done', wsContentCreate)
  return wsContentCreate
}
export const wsNodeSave = async (context, node) => {
  logD('wsNodeSave start', node)

  // checks
  {
    // assert.ok(node.category)
    assert.ok(node.spheres.length >= 0 && node.spheres.length <= 10)
    // assert.ok(node.compositions.length > 0)
    assert.ok(['PIP', 'SLIDER', 'VERTICAL', 'HORIZONTAL'].includes(node.layout))
    for (let c of node.compositions) {
      // assert.ok(c.layers.length > 0)
      assert(c.spheres && c.spheres.length >= 0 && c.spheres.length <= 10)
      // assert(c.operation)
      let compositionLen = 0
      for (let l of c.layers) {
        assert.ok(l.content && l.content.oid)
        assert(l.spheres && l.spheres.length >= 0 && l.spheres.length <= 10)
        assert.ok(l.figuresAbsolute && l.figuresAbsolute.length === 2)
        let start = l.figuresAbsolute[0].t
        let end = l.figuresAbsolute[1].t
        assert.ok(start >= 0 && end > 0)
        assert.ok(end > start)
        compositionLen += (end - start)
      }
      assert(compositionLen <= 60)
    }
  }

  let nodeInput = {}
  nodeInput.layout = node.layout
  nodeInput.name = node.name
  nodeInput.categories = node.categories
  nodeInput.spheres = node.spheres.map(s => {
    return { name: s.name }
  })
  nodeInput.compositions = node.compositions.map(c => {
    return {
      thumbUrl: c.thumbUrl,
      spheres: c.spheres.map(s => {
        return { name: s.name }
      }),
      layers: c.layers.map(l => {
        return {
          contentOid: l.contentOid,
          speed: l.speed,
          figuresAbsolute: l.figuresAbsolute.map(f => {
            return {
              t: f.t,
              points: f.points.map(p => {
                return { x: p.x, y: p.y }
              })
            }
          }),
          spheres: l.spheres.map(s => {
            return { name: s.name }
          }),
          color: l.color,
          thumbUrl: l.thumbUrl
        }
      }),
      operation: {
        items: c.operation.items,
        operations: c.operation.operations,
        type: c.operation.type
      }
    }
  })

  logD('wsNodeSave nodeInput ', nodeInput)
  let res
  if (node.oid) {
    let { data: { wsNodeUpdate } } = await apollo.clients.api.mutate({
      mutation: gql`
        ${fragments.nodeFragment}
        mutation sw_network_only_wsNodeUpdate ($oid: OID!, $node: NodeInput!) {
          wsNodeUpdate (oid: $oid, node: $node) {
            ...nodeFragment
          }
        }
      `,
      variables: {
        oid: node.oid, node: nodeInput
      }
    })
    res = wsNodeUpdate
  } else {
    let { data: { wsNodeCreate } } = await apollo.clients.api.mutate({
      mutation: gql`
        ${fragments.wsItemFragment}
        mutation sw_network_only_wsNodeCreate ($node: NodeInput!) {
          wsNodeCreate (node: $node) {
            ...wsItemFragment
          }
        }
      `,
      variables: {
        node: nodeInput
      }
    })
    res = wsNodeCreate
  }
  logD('wsNodeSave done', res)
  return res
}
export const wsItemDelete = async (context, oid) => {
  logD('wsItemDelete start', oid)
  assert.ok(oid)
  let { data: { wsItemDelete } } = await apollo.clients.api.mutate({
    mutation: gql`
      mutation sw_network_only_wsItemDelete ($oid: OID!) {
        wsItemDelete (oid: $oid)
      }
    `,
    variables: {
      oid
    }
  })
  logD('wsItemDelete done', wsItemDelete)
  return wsItemDelete
}
