<template lang="pug">
.column.fit
  //- header
  div(v-if="false").row.full-width.justify-center.q-pa-xs
    div(
      :style=`{
        maxWidth: $store.state.ui.maxWidthPage+'px', height: '60px',
        borderRadius: '10px', overflow: 'hidden'
      }`
      ).row.full-width.items-center.content-center.bg-grey-9
      div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="grey-3" icon="search")
      .col.full-height
        .row.fit.items-center.content-center.justify-end.q-px-sm
          q-btn(
            v-for="(m, mi) in modes" :key="m.id" @click="modeLocal = m.id"
            round flat
            :color="m.id === modeComputed ? 'green' : 'grey-3'"
            :icon="m.icon"
          )
      //- div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
      //-   q-btn(round flat color="grey-3" icon="more_vert")
  .col
    component(
      :is="`node-list-${modeComputed}`"
      :nodes="nodes"
      :nodeIndex="nodeIndex"
      :nodesBan="nodesBan"
      :nodesHighlight="nodesHighlight"
      @nodeMiddle="$emit('nodeMiddle', $event)")
      template(v-slot:header)
        slot(name="header")
</template>

<script>

import nodeListName from 'components/node/list_name'
import nodeListMiddle from 'components/node/list_middle'
import nodeListByte from 'components/node/list_byte'

export default {
  name: 'nodeList',
  components: {nodeListName, nodeListMiddle, nodeListByte},
  props: {
    mode: {type: String, default () { return 'middle' }},
    nodes: {type: Array},
    nodesBan: {type: Array},
    nodesHighlight: {type: Array},
    nodeIndex: {type: Number},
    nodeOid: {type: String},
    options: {type: Object},
  },
  data () {
    return {
      modeLocal: null,
      modes: [
        {id: 'name', name: 'Name', icon: 'view_agenda'},
        {id: 'middle', name: 'Middle', icon: 'branding_watermark'},
        // {id: 'byte'}
      ]
    }
  },
  computed: {
    modeComputed () {
      if (this.modeLocal) return this.modeLocal
      else return this.mode
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
