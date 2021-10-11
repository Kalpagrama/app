// сути на образ
<template lang="pug">
  .row.full-width.justify-center.q-px-sm
    q-dialog(
      v-model="itemEditorShow"
      :maximized="false"
      position="standard")
      essence-editor(
        :item="newNode"
        :publish="true"
        @close="$event?$go('/node/'+$event.oid):null, $event?$emit('close'):null, itemEditorShow=false")
    //header
    .row.full-width.justify-between.items-center
      q-resize-observer(@resize="headerHeight = $event.height")
      span.text-grey-5.text-capitalize {{$t('рейтинг смыслов')}}
      q-btn(round flat color="grey-5" icon="clear" @click="$emit('close')")
    q-virtual-scroll(ref="vs" :items="essencesNodes" :virtual-scroll-item-size="40" :style=`{maxHeight: height-headerHeight+'px'}` separator).full-width
      template(v-slot="{ item: node, index: itemIndex}")
        div(
          :style=`{minHeight: '40px', border: '1px solid ' + (essenceNodesIndx === itemIndex ? $getPaletteColor('green-7') : $getPaletteColor('grey-9')), borderRadius: '10px'}`
          @click="$emit('set-node', node), $emit('close')").cursor-pointer.row.full-width.items-center.q-mb-sm.q-px-xs.b-35
          span.text-grey-5 {{itemIndex+1}}
          span(:style=`{textAlign: 'center'}`).text-grey-5.col {{node.name}}
          q-circular-progress(v-if="node.countVotes > 1" :value="node.rate" :min="0" :max="maxRate" show-value dark size="sm" color="green" :thickness="0.09" track-color="grey-9" @click="")
            span {{node.countVotes}}
    //q-btn(round flat no-caps icon="add" color="green" @click="itemEditorShow=true").full-width.position-relative
    //  //span.text-grey.absolute-left.q-pl-md {{$t('Essence rating')}}
    //  q-btn(round flat color="white" icon="clear" @click="$emit('close')").absolute-right

  </template>

<script>

export default {
  name: 'pageEssences',
  components: {},
  props: ['height', 'essencesNodes', 'essenceNodesIndx', 'newNode'],
  data () {
    return {
      itemEditorShow: false,
      headerHeight: 0,
    }
  },
  computed: {
    maxRate () {
      return this.essencesNodes.reduce((acc, v) => acc > v.rate ? acc : v.rate)
    }
  },
  mounted () {
    this.$log('mounted')
    this.$refs.vs.scrollTo(this.essenceNodesIndx)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
