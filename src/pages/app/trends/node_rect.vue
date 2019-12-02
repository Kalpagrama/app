<template lang="pug">
div(
  v-if="r"
  @click.self="hide()"
  v-touch-swipe:down.mouse.prevent="swipeDown"
  :style=`{position: 'relative', opacity: opacity, background: 'rgba(0,0,0,'+bgOpacity+')'}`).row.fit
  div(
    ref="nodeRectWrapper"
    :style=`{
      position: 'absolute',
      top: r.top+'px',
      left: r.left+'px',
      height: r.height+'px', width: r.width+'px',
      borderRadius: '10px', overflow: 'hidden'
    }`).row.bg-white
    //- span nodeRect {{rect.top}}
    //- node(
    //-   v-if="$store.state.ui.rectNode"
    //-   :node="$store.state.ui.rectNode")
</template>

<script>
export default {
  name: 'nodeRect',
  props: ['rect'],
  data () {
    return {
      r: null,
      opacity: 0,
      bgOpacity: 0,
      clone: null
    }
  },
  methods: {
    swipeDown (e) {
      this.$logD('swipeDonw', e)
      this.hide()
    },
    hide () {
      this.$logD('hide')
      // this.clone.setAttribute('opened', false)
      this.$tween.to(this.r, 0.5, {top: this.rect.top})
      this.$tween.to(
        this,
        0.5,
        {
          bgOpacity: 0,
          onComplete: () => {
            this.$emit('hide')
          }
        }
      )
    }
  },
  async mounted () {
    this.$logD('mounted')
    this.r = JSON.parse(JSON.stringify(this.rect))
    await this.$wait(300)
    this.$nextTick(() => {
      this.$tween.to(this.r, 0.4, {top: 8})
      this.$tween.to(this, 0.1, {opacity: 1})
      this.$tween.to(this, 0.7, {bgOpacity: 1})
    })
    let clone = this.$store.state.ui.rectClone
    this.clone = this.$refs.nodeRectWrapper.appendChild(clone)
    this.clone.setAttribute('ref', 'shit')
    this.$logD('this.clone', this.clone)
    this.$logD('$refs.shit', this.$refs.nodeRectWrapper)
    // this.clone.nodeHello()
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
