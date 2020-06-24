<template lang="pug">
.row.fit.justify-center
  .column.fit
    //- body
    .col.full-width.scroll
      kalpa-loader(v-if="content.oid" :mangoQuery="mangoQuery")
        template(v-slot=`{items}`)
          list-middle(
            :items="items"
            :options=`{paddingTop: 50, paddingBottom: $q.screen.height/3}`)
            template(v-slot:item=`{item, index, indexMiddle}`)
              node(
                ctx="list" layout="PIP"
                :node="item" :index="index" :essence="true"
                :needFull="index >= indexMiddle-1 && index <= indexMiddle+1"
                :visible="index >= indexMiddle-1 && index <= indexMiddle+1"
                :active="listActive && index === indexMiddle"
                :mini="false")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageExplore',
  props: ['content'],
  inject: ['sidPlayer'],
  data () {
    return {
    }
  },
  computed: {
    storePlayer () {
      return window.stores[this.sidPlayer]
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.content.oid
        }
      }
    },
    listActive () {
      return !this.storePlayer.playing
    }
  },
  mounted () {
    this.$log('mounted')
    this.storePlayer.player.pause()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
