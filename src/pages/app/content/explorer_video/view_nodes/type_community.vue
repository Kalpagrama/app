<template lang="pug">
kalpa-loader(
  :immediate="true"
  :query="nodesQuery" @items="nodesLoaded" v-slot=`{items, next}`)
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width.items-start.content-start
    div(
      v-for="item in items" :key="item.oid"
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
      }`
      ).row.full-width.q-mb-xs
      node-item(
        :node="item" :player="player" :contentKalpa="contentKalpa"
        @toggleSelect="nodeSelectedOid === item.oid ? nodeSelectedOid = null : nodeSelectedOid = item.oid"
        :style=`{
          position: 'relative', zIndex: 10,
          borderRadius: '10px', overflow: 'hidden',
          background: nodeSelectedOid === item.oid ? 'rgb(60,60,60)' : 'rgb(35,35,35)'
        }`
        )
      //- node selected
      div(
        v-if="nodeSelectedOid === item.oid"
        :style=`{
          zIndex: 2,
          marginTop: '-10px', paddingTop: '14px',
          borderRadius: '0 0 10px 10px',
        }`
        ).row.full-width.bg-green.q-py-xs.q-px-xs
        slot(name="nodeActionAll" :node="item")
        div(v-if="!$scopedSlots.nodeActionAll").row.full-width
          q-btn(round flat dense color="white" icon="edit")
          .col
          q-btn(v-if="pick" flat color="red" no-caps @click="pick(item)") Выбрать ядро
          q-btn(v-if="!pick" round flat dense color="white" icon="launch" @click="$router.push(`/node/${item.oid}`)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeItem from './type_community_item.vue'

export default {
  name: 'typeCommunity',
  inject: ['pick'],
  props: ['node', 'player', 'contentKalpa', 'contentBookmark', 'onlyMine'],
  components: {
    nodeItem
  },
  data () {
    return {
      nodeSelectedOid: null,
    }
  },
  computed: {
    nodesQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.contentKalpa.oid
        },
        populateObjects: true,
      }
      if (this.onlyMine) {
        res.selector.oidAuthor = {$eq: this.$store.getters.currentUser().oid}
      }
      return res
    },
  },
  methods: {
    nodeClick (node) {
      this.$log('nodeClick', node)
      if (this.nodeSelectedOid === node.oid) this.nodeSelectedOid = null
      else {
        this.nodeSelectedOid = node.oid
        let t = node.items[0].layers[0].figuresAbsolute[0].t
        this.player.setCurrentTime(t)
      }
    },
    nodesLoaded (nodes) {
      this.$log('nodesLoaded', nodes.length)
      let fragments = nodes.reduce((acc, node) => {
        node.items.map(item => {
          if (item.layers[0].contentOid === this.contentKalpa.oid) {
            let fragmentInput = {
              name: node.name,
              items: [item],
              spheres: []
            }
            acc.push(fragmentInput)
          }
        })
        return acc
      }, [])
      this.$log('fragments', fragments)
      this.$store.commit('ui/stateSet', ['contentNodes', JSON.parse(JSON.stringify(fragments))])
    }
  }
}
</script>
