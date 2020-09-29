<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px',}`).row.full-width.items-start.content-start
    kalpa-loader(
      :immediate="true" @reset="$refs.kl1.next(0, () => {})"
      :query="nodesQuery" @items="nodesLoaded" v-slot=`{items, next}`
      )
      masonry(
        :cols="$q.screen.width < 600 ? 2 : 4"
        :gutter="{default: 10}").full-width.q-pt-sm.q-pr-sm
        div(
          v-for="item in items" :key="item.oid"
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
          }`
          ).row.full-width.b-40.q-mb-sm
          node-item(
            :node="item" :player="player" :contentKalpa="contentKalpa"
            @toggleSelect="nodeSelectedOid === item.oid ? nodeSelectedOid = null : nodeSelectedOid = item.oid")
          //- node selected
          div(
            v-if="nodeSelectedOid === item.oid"
            :style=`{
              marginTop: '-10px', paddingTop: '14px',
              borderRadius: '0 0 10px 10px',
            }`
            ).row.full-width.bg-green.q-py-xs.q-px-xs
            slot(name="nodeActionAll" :node="item")
            div(v-if="!$scopedSlots.nodeActionAll").row.full-width
              q-btn(round flat dense color="white" icon="edit")
              .col
              q-btn(round flat dense color="white" icon="launch" @click="$router.push(`/node/${item.oid}`)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeItem from './node-item.vue'

export default {
  name: 'wsContentExplorer_viewNodes',
  components: {nodeItem},
  props: ['contentKalpa', 'contentBookmark', 'player'],
  data () {
    return {
      nodeSelectedOid: null
    }
  },
  computed: {
    nodesQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          // oidAuthor: {$ne: this.$store.getters.currentUser().oid},
          oidSphere: this.contentKalpa.oid
        },
        populateObjects: true,
      }
    }
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
