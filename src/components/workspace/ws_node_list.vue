<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- ADD action
  q-btn(
    round push size="lg" color="green" icon="add" @click="$emit('add', {type: 'node', item: null})"
    :style=`{position: 'absolute', zIndex:1000, right: '16px', bottom: '16px', borderRadius: '50% !important'}`)
  //- header with filters...
  .row.full-width.q-px-sm
    .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px', height: '70px'}`).row.full-width.items-center.content-center
        q-input(
          v-model="searchInput" filled color="green"
          placeholder="Search nodes"
          :input-style=`{paddingLeft: '10px'}`
          :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width.bg-grey-2
        //- div(:style=`{height: '40px'}`).row.full-width
    //- .col.full-height
    //- list, gallery, feed
    //- div(:style=`{width: '60px', height: '60px'}`
    //-   ).row.items-center.content-center.justify-center
    //-   q-btn(round flat color="green" icon="refresh" @click="nodesReload()")
    //- debug
    div(
      v-if="$store.state.ui.debug"
      :style=`{borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-width.items-center.content-center.bg-green.q-pa-sm.q-my-sm
      small.text-white.full-width oid: {{ oid }}
  //- body
  //- TODO add scroll area from quasar... width initial scroll height
  div(ref="wsNodesWrapper").col.full-width.scroll
    .row.full-width.justify-center
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.maxWidthPage+'px', paddingTop: '0px', paddingBottom: '80px'}`
        ).row.full-width.items-start.content-start
        //- nodes
        kalpa-loader(type="NODE_LIST" :variables=`{}`)
          template(v-slot:items=`{items}`)
            ws-node(
              v-for="(n, ni) in items" :key="n.oid" @nodeClick="nodeClick"
              :oid="oid" :node="n")
</template>

<script>
import wsNode from './ws_node'

export default {
  name: 'wsNodes',
  components: {wsNode},
  props: [],
  data () {
    return {
      searchInput: ''
    }
  },
  computed: {
    oid () {
      return this.$route.params.oid
    }
  },
  methods: {
    nodeClick (node) {
      this.$log('nodeClick', node)
      this.$emit('item', {type: 'node', item: node})
    }
  },
  async mounted () {
    // this.$log('mounted')
    // this.$refs.wsNodesWrapper.scrollTop = 80
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
