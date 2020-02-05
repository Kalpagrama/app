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

export const wsCompositionCreate = async (context, input) => {
  logD('wsCompositionCreate start', input)
  let { data: {wsCompositionCreate } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.wsItemFragment}
      mutation sw_network_only_wsCompositionCreate ($composition: CompositionInput!) {
        wsCompositionCreate(composition: $composition) {
          ...wsItemFragment
        }
      }
    `
  })
  logD('wsCompositionCreate done', wsCompositionCreate)
  return wsCompositionCreate
}

export const wsNodeSave = async (context, node) => {
  logD('wsNodeSave start', node)

  // checks
  {
    assert.ok(node.spheres.length >= 0)
    assert.ok(node.compositions.length >= 0)
    assert.ok(['PIP', 'SLIDER', 'VERTICAL', 'HORIZONTAL'].includes(node.layout))
  }

  logD('wsNodeSave check OK')
  let nodeInput = {}
  nodeInput.layout = node.layout
  nodeInput.name = node.name
  nodeInput.category = node.category || 'FUN'
  nodeInput.spheres = node.spheres.map(s => {
    return {name: s.name}
  })
  nodeInput.compositions = []
  node.compositions.map(c => {
    if (c !== null) {
      nodeInput.compositions.push({
        spheres: [],
        operation: c.operation,
        layers: c.layers.map(l => {
          return {
            contentOid: l.content.oid,
            spheres: [],
            figuresAbsolute: l.figuresAbsolute.map(f => {
              return {
                t: f.t,
                points: f.points.map(p => {
                  return {
                    x: p.x,
                    y: p.y,
                    z: p.z
                  }
                })
              }
            })
          }
        })
      })
    }
  })

  logD('wsNodeSave nodeInput ', nodeInput)
  let res
  if (node.oid) {
    let { data: { wsNodeUpdate } } = await apollo.clients.api.mutate({
      mutation: gql`
        ${fragments.wsItemFragment}
        mutation sw_network_only_wsNodeUpdate ($oid: OID!, $node: NodeInput!) {
          wsNodeUpdate (oid: $oid, node: $node) {
            ...wsItemFragment
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
