<template lang="pug">
//- kalpa-loader(:mangoQuery="queryBySphere")
  template(v-slot=`{items,next}`)
    list-masonry(:items="items" :itemsHidden="[node.oid]").q-pt-md
      template(v-slot:item=`{item}`)
        node-lite(:node="item")
.row.full-width.items-start.content-start.q-pt-xl
  div(
    v-for="(n,ni) in 10" :key="ni"
    :style=`{position: 'relative'}`
    ).row.full-width.items-between
    .col.full-height
      node-lite(:node="node" :isActive="false" :isVisible="false")
    div(:style=`{width: '80px',}`).row.full-height.justify-center
    div(
      :style=`{
        position: 'absolute', zIndex: 1000, right: '0px', top: '0px',
        width: '80px', minHeight: '100px',
      }`
      ).row.full-height.justify-center
      div(:style=`{height: '100%', width: '1px'}`).bg-green
      div(
        :style=`{position: 'absolute', zIndex: 1100, bottom: '100px'}`
        ).row.full-width.justify-center
        q-btn(
          round flat icon="insert_link" color="green" stack
          size="lg"
          ).b-30 88
</template>

<script>
import { NodeApi } from 'src/api/node'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp__node__nodeNodes',
  props: ['node'],
  data () {
    return {
    }
  },
  computed: {
    queryBySphere () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.node.sphereFromName.oid
        }
      }
    },
    queryByChains () {
      return {}
    },
    queryByNode () {
      return {}
    }
  }
}
</script>
