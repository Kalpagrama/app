<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.bg-black
  //- composition ONE
  div(
    v-if="true"
    :style=`{position: 'relative'}`).col.full-width
    composition(
      ref="cOne"
      :ctx="ctx" :index="0"
      :thumbUrl="node.meta.compositions[0].thumbUrl" :fullHeight="true"
      :composition="nodeFull ? nodeFull.compositions[0] : null"
      :mini="false" :active="active" :visible="visible"
      :style=`{}`)
    q-btn(
      round flat color="white" icon="more_vert"
      :style=`{position: 'absolute', zIndex: 2000, top: '16px', right: '16px'}`)
    div(
      v-ripple=`{color: 'white'}` @click="isVisible = !isVisible"
      :style=`{position: 'absolute', zIndex: 1000, right: 0, top: 0, width: '20%'}`
      ).row.full-height.cursor-pointer
    div(
      v-ripple=`{color: 'white'}` @click="isVisible = !isVisible"
      :style=`{position: 'absolute', zIndex: 1000, left: 0, top: 0, width: '20%'}`
      ).row.full-height.cursor-pointer
  //- essence
  div(:style=`{position: 'relative', height: '60px'}`).row.full-width.items-center.content-center.q-px-md
    //- span.text-red.text-bold {{ index }}
    div(:style=`{minHeight: '50px', borderRadius: '30px', overflow: 'hidden'}`
      ).row.fit.justify-center.items-center.content-center.bg-green
      span.text-white.text-bold {{ node.name }}
  //- composition TWO
  div(
    v-if="true"
    :style=`{position: 'relative'}`).col.full-width
    composition(
      ref="cTwo"
      :ctx="ctx" :index="1"
      :thumbUrl="node.meta.compositions[1].thumbUrl" :fullHeight="true"
      :composition="nodeFull ? nodeFull.compositions[1] : null"
      :mini="false" :active="false" :visible="false"
      :style=`{}`).full-height
    q-btn(
      round flat color="white" icon="more_vert"
      :style=`{position: 'absolute', zIndex: 2000, top: '16px', right: '16px'}`)
    div(
      v-ripple=`{color: 'white'}` @click="isVisible = !isVisible"
      :style=`{position: 'absolute', zIndex: 1000, right: 0, top: 0, width: '20%'}`
      ).row.full-height.cursor-pointer
    div(
      v-ripple=`{color: 'white'}` @click="isVisible = !isVisible"
      :style=`{position: 'absolute', zIndex: 1000, left: 0, top: 0, width: '20%'}`
      ).row.full-height.cursor-pointer
</template>

<script>
export default {
  name: 'nodeLayoutByte',
  props: ['ctx', 'index', 'opened', 'node', 'nodeFull', 'needFull', 'needFullPreload', 'nodeFullReady', 'visible', 'active', 'nodeLoad'],
  data () {
    return {
      isVisible: false,
      dialogShow: false
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
