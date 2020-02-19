<template lang="pug">
div(
  v-touch-swipe.mouse.left.right="handleSwipe"
  :style=`{position: 'relative', minHeight: height+'px', overflow: 'hidden'}`).row.full-width.items-start.content-start.bg-black
  //- debug
  div(v-if="false" :style=`{position: 'absolute', zIndex: 1000, top: '60px'}`).row.bg-green
    small.text-white.full-width index: {{index}}
    small(v-if="styles.length > 0").text-white.full-width styles[2].maxWidth: {{ styles[2].maxWidth }}
    small(v-if="styles.length > 0").text-white.full-width styles[0].maxWidth: {{ styles[0].maxWidth }}
  //- stats
  small(
    v-if="true"
    :style=`{position: 'absolute', zIndex: 50000, top: '4px', right: 'calc(50% - 20px)', borderRadius: '10px', background: 'rgba(0,0,0,0.3)',
      userSelect: 'none'}`
    ).text-white.q-pa-xs {{ index + 1 }}/{{ compositions.length }}
  //- preview
  img(
    ref="playerPreview"
    :src="compositions[0].preview" @load="previewLoad" @error="previewError"
    :style=`{position: 'relative', width: '100%', objectFit: 'contain', opacity: 0}`)
  //- compositions
  div(
    v-for="(c, ci) in compositions" :key="ci"
    v-if="height > 0 && styles.length > 0 && ci > index-2 && ci < index+2"
    :style=`{
      ...compositionStyle(ci),
      position: 'absolute', bottom: 0, borderRadius: '10px', overflow: 'hidden',
      //- border: ci > index ? '2px solid red' : ci < index ? '2px solid blue' : 'none',
      zIndex: ci === index ? 200 : 300,
      opacity: ci === index ? styles[1].opacity : ci === index+1 ? styles[2].opacity : styles[0].opacity,
      maxWidth: ci === index ? styles[1].maxWidth+'%' : ci === index+1 ? styles[2].maxWidth+'%' : styles[0].maxWidth+'%',
      maxHeight: ci === index ? styles[1].maxHeight+'%'+'px' : ci === index+1 ? styles[2].maxHeight+'px' : styles[0].maxHeight+'px',
      height: isMini(ci) ? 'auto' : '100%'
    }`).row.full-width.items-end.content-end
    composition(
      :ctx="ctx"
      :value="c.composition" :preview="c.preview"
      :mini="isMini(ci)"
      :visible="visible && ci >= index-1 && ci <= index+1"
      :active="active && ci === index"
      :style=`{borderRadius: '10px', overflow: 'hidden'}`
      @next="compositionNext(ci)"
      @error="$event => compositionError(ci, $event)")
      //- @ended="compositionNext(ci + 1)"
</template>

<script>
export default {
  name: 'compositionPlayer',
  props: ['ctx', 'visible', 'active', 'compositions'],
  data () {
    return {
      index: 0,
      indexErrored: [],
      indexNexting: -1,
      height: 0,
      width: 0,
      stylesInitial: [
        {zIndex: 300, maxWidth: 30, maxHeight: 100, opacity: 0.8},
        {zIndex: 200, maxWidth: 100, maxHeight: 100, opacity: 1},
        {zIndex: 300, maxWidth: 30, maxHeight: 100, opacity: 0.8}
      ],
      styles: []
    }
  },
  methods: {
    handleSwipe (e) {
      // this.$log('handleSwipe', e)
      if (e.direction === 'left') this.compositionNext(this.index + 1)
      else this.compositionNext(this.index - 1)
    },
    isMini (ci) {
      return ci === this.indexNexting ? false : ci !== this.index
    },
    previewLoad (e) {
      // this.$log('previewLoad', e)
      // this.height = this.$refs.playerPreview.clientHeight
      this.height = this.$refs.playerPreview.clientHeight > this.$q.screen.height / 3 ? this.$refs.playerPreview.clientHeight : this.$q.screen.height / 3
      this.width = this.$refs.playerPreview.clientWidth
      this.stylesInitial[1].maxHeight = this.height
      this.styles = JSON.parse(JSON.stringify(this.stylesInitial))
      this.$emit('height', this.height)
      this.$emit('width', this.width)
    },
    previewError (e) {
      this.$log('previewError', e)
      this.$emit('error', 'previewError')
    },
    compositionStyle (ci) {
      if (ci > this.index) return {right: '0px'}
      else if (ci < this.index) return {left: '0px'}
    },
    compositionNext (index) {
      this.$log('compositionNext', index)
      if (this.nodeNexting >= 0) return
      if (!this.compositions[index]) {
        // this.index = 0
        // this.compositionNext(0)
        // this.indexNexting = 0
      } else {
        this.indexNexting = index
        let i = index > this.index ? 2 : 0
        this.$log('i', i)
        // this.$tween.to(
        //   this.styles[1],
        //   0.5,
        //   {
        //     opacity: 0,
        //     onComplete: () => {
        //       this.$set(this.styles, 1, JSON.parse(JSON.stringify(this.stylesInitial[1])))
        //     }
        //   }
        // )
        this.$tween.to(
          this.styles[i],
          0.5,
          {
            zIndex: 300,
            maxWidth: 100,
            maxHeight: this.height,
            opacity: 1,
            onComplete: () => {
              // if (index > this.index) this.$set(this.styles, 2, JSON.parse(JSON.stringify(this.stylesInitial[2])))
              // else this.$set(this.styles, 0, JSON.parse(JSON.stringify(this.stylesInitial[0])))
              // this.$set(this.styles, i, JSON.parse(JSON.stringify(this.stylesInitial[i])))
              // this.$set(this.styles, 0, JSON.parse(JSON.stringify(this.stylesInitial[0])))
              // this.$set(this.styles, 1, JSON.parse(JSON.stringify(this.stylesInitial[1])))
              // this.$set(this.styles, 2, JSON.parse(JSON.stringify(this.stylesInitial[2])))
              this.$set(this, 'styles', JSON.parse(JSON.stringify(this.stylesInitial)))
              // this.$set(this, 'index', index)
              this.index = index
              this.indexNexting = -1
            }
          }
        )
      }
    },
    compositionError (index, error) {
      this.$log('compositionError', index, error)
      // TODO hide this composition by index... to indexErrored
      this.$emit('error', error)
    }
  }
}
</script>
