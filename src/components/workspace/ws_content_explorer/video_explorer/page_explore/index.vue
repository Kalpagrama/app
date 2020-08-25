<style lang="sass" scoped>
.node-item
  cursor: pointer
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit.justify-center.b-30
  .column.fit
    //- node PREVIEW
    q-dialog(
      v-model="nodePreviewOpened" position="bottom"
      @hide="nodePreviewed")
      div(
        :style=`{
          height: $q.screen.height+'px',
          minHeight: $q.screen.height+'px',
          maxWidth: '800px',
          borderRadius: '10px',overflow: 'hidden',
        }`).column.b-50
        //- body
        .col.full-width
          node(:node="nodePreviewItem" :nodeFullReady="nodePreviewItem" :active="true" :visible="true" :mini="false")
        //- footer
        div(v-if="true").row.full-width.items-center.content-center.q-pa-sm
          q-btn(
            round flat color="white" icon="keyboard_arrow_left" @click="nodePreviewOpened = false")
          .col.q-pl-sm
            //- q-btn(
            //-   @click="nodeFork(nodeEditorItem)"
            //-   push color="green" no-caps icon="photo_filter"
            //-   :style=`{height: '42px',}`).full-width {{$t('node_fork', 'Взять и изменить')}}
    //- body
    .col.full-width.scroll
      kalpa-loader(v-if="content.oid" :mangoQuery="mangoQuery")
        template(v-slot=`{items, itemsMore}`)
          .row.fit.justify-center
            //- div(:style=`{position: 'absolute', zIndex: 9999, top: '-50px', left: '0px', height: '100px',}`).row.full-width.bg-red.bg
            //- nodes on content bar
            div(
              :style=`{
                position: 'absolute', zIndex: 99999, left: 0, top: '-38px', transform: 'translate3d(0,0,0)',
                height: '30px', pointerEvents: 'none',
              }`
              ).row.full-width.justify-center
              div(:style=`{position: 'relative', maxWidth: barWidth+'px',}`).row.fit
                div(
                  v-for="(i,ii) in items" :key="i.id"
                  :style=`{
                    position: 'absolute', zIndex: 100+ii,
                    left: nodeStart(i)/content.duration*100+'%',
                    width: '2px',
                  }`
                  ).row.full-height.bg-grey-4
            //- list of nodes
            list-masonry(:items="items").q-px-sm
              template(v-slot:item=`{item}`)
                div(
                  @click="nodeClick(item)"
                  :class=`{
                    'b-50': nodeSelectedOid !== item.oid,
                    'bg-green': nodeSelectedOid === item.oid,
                  }`
                  :style=`{borderRadius: '10px', overflow: 'hidden'}`
                  ).row.full-width.items-start.content-start
                  img(
                    :src="item.meta.items[0].thumbUrl" draggable="false"
                    :style=`{borderRadius: '10px', overflow: 'hidden', pointerEvents: 'none'}`).full-width
                  .row.full-width.q-px-sm.q-py-xs
                    small.text-white {{ item.name }}
                  div(
                    v-if="nodeSelectedOid === item.oid"
                    :style=`{height: '50px'}`
                    ).row.full-width.items-center.content-center.justify-center.q-px-xs
                    //- .col
                    q-btn(
                      @click="nodeExplore(item)"
                      flat icon-right="open_in_new" no-caps color="white")
                      span.text-white.text-bold.q-mr-sm Explore
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
      nodePreviewOpened: false,
      nodeSelectedOid: null
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
    },
    barWidth () {
      if (this.$q.screen.width > 600) return 600
      else return this.$q.screen.width - 80
    }
  },
  methods: {
    async nodePreview (n) {
      this.$log('nodePreview', n)
      this.nodeClick(n)
      this.storePlayer.pause()
      this.nodePreviewItem = await this.$rxdb.get(RxCollectionEnum.OBJ, n.oid)
      this.nodePreviewOpened = true
    },
    nodePreviewed () {
      this.$log('nodePreviewed')
      this.storePlayer.play()
    },
    nodeExplore (item) {
      this.$log('nodeExplore')
      this.$router.push(`/node/${item.oid}`)
    },
    nodeClick (n) {
      this.$log('nodeClick', n)
      let t = this.nodeStart(n)
      this.storePlayer.setCurrentTime(t)
      this.nodeSelectedOid = n.oid
    },
    nodeStart (n) {
      let item = n.meta.items.find(i => {
        return i.layers[0].contentOid === this.content.oid
      })
      if (!item) return 0
      this.$log('item', item)
      let t = item.layers[0].figuresAbsolute[0].t
      return t
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
