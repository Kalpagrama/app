// сути на образ
<template lang="pug">
  .row.full-width.justify-center.content-start.q-px-sm
    //header
    .row.full-width.justify-between.items-center
      q-resize-observer(@resize="headerHeight = $event.height")
      span.text-grey-5 {{$t('Рейтинг смыслов')}}
      q-btn(round flat color="grey-5" icon="clear" @click="$emit('close')")
    q-virtual-scroll(ref="vs" :items="essencesNodes" :virtual-scroll-item-size="40" :style=`{maxHeight: height-headerHeight+'px'}` separator).full-width
      template(v-slot="{ item: node, index: itemIndex}")
        div(
          :style=`{minHeight: '40px', border: '1px solid ' + (essencesNodesIndx === itemIndex ? $getPaletteColor('green-7') : $getPaletteColor('grey-9')), borderRadius: '10px'}`
          @click="$emit('set-node', node), $emit('close')").cursor-pointer.row.full-width.items-center.q-mb-sm.q-px-xs.b-35
          span.text-grey-5 {{itemIndex+1}}
          span(:style=`{textAlign: 'center'}`).text-grey-5.col {{node.name}} weight:{{node.weight}} rate:{{node.rate}}
          q-circular-progress(v-if="node.rate >= 0" :value="node.weight" :min="0" :max="maxWeght" show-value
          dark size="sm" color="green-10" :thickness="0.3" track-color="grey-9" :center-color="$getRateMeta(node.rate).colorName" @click="")
            span.text-grey-5 {{node.countVotes}}

  </template>

<script>

import { assert } from 'src/system/common/utils'

export default {
  name: 'pageEssences',
  components: {},
  props: ['node', 'height', 'essencesNodes', 'essencesNodesIndx'],
  data () {
    return {
      headerHeight: 0,
    }
  },
  computed: {
    maxWeght () {
      return this.essencesNodes.reduce((acc, v) => acc > v.rate ? acc : v.weight)
    }
  },
  mounted () {
    this.$log('mounted')
    this.$refs.vs.scrollTo(this.essencesNodesIndx)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
