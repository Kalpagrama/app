<template lang="pug">
.row.fit.justify-center
  .column.fit
    //- body
    .col.full-width.scroll
      kalpa-loader(v-if="content.oid" :mangoQuery="mangoQuery")
        template(v-slot=`{items}`)
          list-middle(
            :items="items")
            template(v-slot:itemFirst)
              div(:style=`{height: '16px'}`).row.full-width
            template(v-slot:item=`{item, index, indexMiddle}`)
              //- node(
              //-   ctx="list" layout="PIP"
              //-   :node="item" :index="index" :essence="true"
              //-   :needFull="index >= indexMiddle-1 && index <= indexMiddle+1"
              //-   :visible="index >= indexMiddle-1 && index <= indexMiddle+1"
              //-   :active="listActive && index === indexMiddle"
              //-   :mini="false")
              div(:style=`{height: '100px',borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-70.q-mb-sm
                img(
                  :src="item.meta.items[0].thumbUrl"
                  draggable="false"
                  :style=`{height: '100px', borderRadius: '10px', overflow: 'hidden',}`)
                .col.full-height
                  .row.fit.items-stat.content-start.q-pa-md
                    span(:style=`{userSelect: 'none'}`).text-white.text-bold {{ item.name }}
            template(v-slot:itemLast)
              div(:style=`{height: '400px'}`).row.full-width
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageExplore',
  props: ['content'],
  inject: ['sidPlayer'],
  data () {
    return {
      mode: 'mini', // maxi, mini
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
