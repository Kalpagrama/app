<template lang="pug">
.row.full-width.items-start.content-start.justify-center.br
  div(
    :style=`{
      maxWidth: $store.state.ui.maxWidthPage+'px',
    }`).row.full-width.items-start.content-start
    div(:style=`{height: '100px'}`
      ).row.full-width.items-center.content-center.q-py-md.q-px-sm
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Node nodes
    kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
      template(v-slot=`{items}`)
        list-middle(
          :items="items" :itemsBan="itemsBan"
          :options=`{paddingTop: 0, paddingBottom: $q.screen.height/3}`)
          template(v-slot:item=`{item, index, indexMiddle}`)
            node(
              ctx="list" layout="PIP"
              :node="item" :index="index" :essence="true"
              :needFull="index >= indexMiddle-1 && index <= indexMiddle+1"
              :visible="index >= indexMiddle-1 && index <= indexMiddle+1"
              :active="index === indexMiddle"
              :mini="false")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeExplorer-nodeNodes',
  props: ['node'],
  data () {
    return {
    }
  },
  computed: {
    itemsBan () {
      return [this.node.oid]
    },
    sphereOid () {
      this.$log('node_nodes: this.node=', this.node)
      return this.node.sphereFromName.oid
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.sphereOid
        }
      }
    }
  },
  methods: {
  }
}
</script>
