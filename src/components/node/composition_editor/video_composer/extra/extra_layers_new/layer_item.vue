<template lang="pug">
div(
  :class=`{}`
  :style=`{
    position: 'relative',
    height: height+'px',
    borderBottom: '1px solid rgb(50,50,50)',
    borderRadius: '10px', overflow: 'hidden'
  }`
  ).row.full-width.items-end.b-100
  div(
    v-if="view === 'mini'" @click="layerClickMini()"
    :style=`{
      position: 'absolute', top: '0px', zIndex: 100,
      left: (layer.figuresAbsolute[0].t/meta.duration)*100+'%',
      width: ((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/meta.duration)*100+'%',
      height: '10px',
      background: layer.color,
      borderRadius: '10px', overflow: 'hidden'
    }`
    ).row
    //- span {{layer.figuresAbsolute[0]}}
  div(v-if="height >= 50").row.full-width.scroll.q-pa-md
    //- div(:style=`{height: '70px', width: '50%'}`)
    div(
      :style=`{
        position: 'relative',
        height: '50px',
        borderRadius: '10px',
      }`).row.no-wrap.items-center.content-center.justify-start.b-190
      //- frames
      div(
        v-for="(f,fi) in 50" :key="fi"
        :style=`{height: '50px', width: '50px', pointerEvents: 'none', borderRight: '1px solid rgb(120,120,120)'}`
        ).row.items-center.content-center.justify-center {{ fi }}
    //- div(:style=`{height: '70px', width: '50%'}`)
</template>

<script>
export default {
  name: 'extraLayers-layerItem',
  props: ['player', 'meta', 'layer', 'layerIndex', 'layerIsFirst', 'layerIsLast', 'layerMaxHeight'],
  data () {
    return {
      view: 'mini',
      height: 40
    }
  },
  computed: {
  },
  watch: {
    view: {
      handler (to, from) {
        this.$log('view CHANGED', to)
      }
    }
  },
  methods: {
    layerClickMini () {
      this.$log('layerClickMini')
      if (this.height === 80) {
        this.$tween.to(this, 0.5, {height: 40})
      }
      else {
        this.$tween.to(this, 0.5, {height: 80})
      }
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
