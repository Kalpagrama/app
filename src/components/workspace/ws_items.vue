<template lang="pug">
div(
  :style=`{position: 'relative', width: width+'px', maxWidth: width+'px', borderRight: '1px solid #4caf50'}`
  ).column.full-height
  q-btn(
    round push color="green" @click="width === 0 ? width = 400 : width = 0"
    :icon="width === 0 ? 'keyboard_arrow_right' : 'keyboard_arrow_left'"
    :style=`{position: 'absolute', zIndex: 1000, right: '-60px', top: '50%'}`)
  //- header
  div(
    :style=`{height: '60px'}`
    ).row.full-width.items-center.content-center
    div(
      :style=`{height: '60px', width: '60px'}`
      ).row.items-center.justify-center
      q-btn(round flat color="green" icon="school")
    .col.full-height
      .row.fit.items-center
        span.text-bold.text-green Workspace
    div(
      :style=`{height: '60px', width: '60px'}`
      ).row.items-center.justify-center
      q-btn(round flat color="green" icon="settings")
  //- pages
  .row.full-width.q-px-md
    span(
      v-for="(p,pi) in pages" :key="p.id" @click="page = p.id"
      :style=`{
        borderRadius: '10px',
        color: page === p.id ? 'white !important' : '#4caf50',
        background: page === p.id ? '#4caf50' : 'none'}`
      ).text-green.text-bold.cursor-pointer.q-pa-sm.q-mr-md {{ p.name }}
  //- body
  .col.full-width
    ws-contents(v-if="page === 'contents'" @item="itemClick")
    ws-nodes(v-if="page === 'nodes'" @item="itemClick")
</template>

<script>
import wsContents from './ws_contents'
import wsNodes from './ws_nodes'

export default {
  name: 'wsItems',
  components: {wsContents, wsNodes},
  props: ['node'],
  data () {
    return {
      width: 400,
      page: 'contents',
      pages: [
        {id: 'contents', name: 'Contents'},
        {id: 'nodes', name: 'Nodes'}
      ],
      nodes: []
    }
  },
  computed: {
  },
  methods: {
    itemClick (item) {
      this.$log('itemClick', item)
      this.$emit('node', JSON.parse(JSON.stringify(item)))
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
