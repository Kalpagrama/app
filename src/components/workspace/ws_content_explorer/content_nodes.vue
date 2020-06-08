<template lang="pug">
.column.fit
  .row.full-width.q-pa-md
    span(:style=`{fontSize: '18px'}`).text-white.text-bold Nodes
  .col.full-width.scroll.q-pa-sm
    kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
      template(v-slot=`{items}`)
        list-middle(
          @indexMiddle="indexMiddleChanged"
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
  name: 'contentNodes',
  props: ['stateExplorer'],
  data () {
    return {
      itemsBan: []
    }
  },
  computed: {
    sphereOid () {
      return this.stateExplorer.content.oid
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.sphereOid
        }
      }
    }
  }
}
</script>
