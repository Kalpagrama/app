<template lang="pug">
q-page(
  :style=`{
  }`
  ).row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px',}`).row.full-width.items-start.content-start
    kalpa-loader(:mangoQuery="nodesQuery" @items="nodesChanged")
      template(v-slot=`{items, next}`)
        list-masonry(:items="items" :class=`{}`).q-pt-md
          template(v-slot:item=`{item}`)
            div(
              :style=`{
                borderRadius: '10px', overflow: 'hidden',
              }`
              ).row.full-width.b-40
              div(
                @click="nodeClick(item)"
                :style=`{
                  position: 'relative', zIndex: 100,
                  borderRadius: '10px', overflow: 'hidden',
                }`
                ).row.full-width.items-start.content-start.b-40
                node-lite(
                  :node="item"
                  :showEssence="false"
                  :showAuthor="false"
                  :marginBottom="0"
                  :style=`{
                    pointerEvents: 'none',
                    borderRadius: '10px', overflow: 'hidden',
                  }`)
                //- mini essence
                div(
                  :style=`{
                    position: 'relative', zIndex: 100,
                    borderRadius: '10px', overflow: 'hidden',
                  }`).row.full-width.q-pa-sm.b-40
                  small.text-white {{ item.name }}
              //- node selected
              div(
                v-if="nodeSelectedOid === item.oid"
                :style=`{
                  marginTop: '-10px', paddingTop: '14px',
                  borderRadius: '0 0 10px 10px',
                }`
                ).row.full-width.bg-green.q-py-xs.q-px-xs
                q-btn(round flat dense color="white" icon="edit")
                .col
                q-btn(round flat dense color="white" icon="launch" @click="$router.push(`/node/${item.oid}`)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsContentExplorer_viewNodes',
  props: ['contentKalpa', 'contentWorkspace', 'player'],
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
          populateObjects: true,
          oidSphere: this.contentKalpa.oid
        }
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
    nodesChanged (nodes) {
      this.$log('nodesChanged', nodes)
      let fragments = nodes.reduce((acc, node) => {
        let fragmentInput = {
          name: node.name,
          items: [node.items[0]],
          spheres: []
        }
        acc.push(fragmentInput)
        return acc
      }, [])
      this.$log('fragments', fragments)
      this.$store.commit('ui/stateSet', ['contentNodes', JSON.parse(JSON.stringify(fragments))])
    }
  }
}
</script>
