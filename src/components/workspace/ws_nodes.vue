<template lang="pug">
.row.fit
  div(:style=`{position: 'relative'}`).column.fit
    //- actions
    q-btn(
      round push size="lg" color="green" icon="add" @click="$emit('add')"
      :style=`{position: 'absolute', zIndex:1000, right: '16px', bottom: '16px'}`)
    //- header with filters...
    .row.full-width.q-px-sm
      .col.full-height
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
      div(:style=`{paddingTop: '0px', paddingBottom: '80px'}`).row.full-width.items-start.content-start.q-px-sm
        kalpa-loader(type="wsNodes" :variables=`{}`)
          template(v-slot:items=`{items}`)
            ws-node(
              v-for="(n, ni) in items" :key="n.oid" @nodeClick="$emit('item', $event)"
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
    }
  },
  computed: {
    oid () {
      return this.$route.params.oid
    }
  },
  methods: {
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
