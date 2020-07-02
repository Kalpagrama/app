<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 100,
  }`).row.fit
  div(
    v-for="(i,ii) in items" :key="ii"
    :style=`{
      position: 'relative',
      maxWidth: p[ii]+'%',
    }`
    ).col.full-height
    q-btn(
      @click="resizerClick"
      round flat dense color="white" icon="menu"
      :style=`{
        position: 'absolute', top: 'calc(50% - 20px)',
        background: 'rgba(0,0,0,0.5)', borderRadius: '10px', overflow: 'hidden',
      }`)
    slot(name="item" :item="i" :itemIndex="ii" :itemActive="p[ii] > 50")
</template>

<script>
export default {
  name: 'listHorizontal',
  props: {
    items: {type: Array, default () { return [] }},
  },
  data () {
    return {
      p: [80, 10, 10]
    }
  },
  methods: {
    resizerClick (e) {
      this.$log('resizerClick', e)
    }
  }
}
</script>
