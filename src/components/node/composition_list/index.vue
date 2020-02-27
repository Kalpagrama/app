<template lang="pug">
div(
  v-touch-swipe.mouse.left.right="handleSwipe"
  :style=`{position: 'relative', minHeight: height+'px', overflow: 'hidden'}`).row.full-width.items-center.content-center.bg-black
  //- debug
  //- small(:style=`{position: 'absolute', zIndex: 4100, top: '0px', right: '0px'}`).bg-red.text-white {{nodeOid}}
  div(v-if="false" :style=`{position: 'absolute', zIndex: 1000, top: '60px'}`).row.text-white.bg-green
    small.text-white.full-width index: {{index}}
    small.full-width visible/active/mini {{visible}}/{{active}}/{{mini}}
  //- stats
  small(
    v-if="true"
    :style=`{position: 'absolute', zIndex: 4000, top: '4px', right: 'calc(50% - 20px)', borderRadius: '10px', background: 'rgba(0,0,0,0.3)',
      userSelect: 'none'}`
    ).text-white.q-pa-xs {{ index + 1 }}/{{ compositions.length }}
  //- preview
  img(
    ref="compositionListPreview"
    :src="compositions[0].preview" @load="previewLoad" @error="previewError"
    draggable="false"
    :style=`{position: 'relative', width: '100%', objectFit: 'contain', opacity: 0, userSelect: 'none'}`)
  //- compositions
  div(
    v-for="(c, ci) in compositionsFiltered" :key="ci"
    v-if="true && height > 0 && styles.length > 0 && ci > index-2 && ci < index+2"
    :style=`{
      ...compositionStyle(ci),
      position: 'absolute', bottom: 0, borderRadius: '10px', overflow: 'hidden',
      //- border: ci > index ? '2px solid red' : ci < index ? '2px solid blue' : 'none',
      zIndex: ci === index ? 200 : 300,
      opacity: ci === index ? styles[1].opacity : ci === index+1 ? styles[2].opacity : styles[0].opacity,
      maxWidth: ci === index ? styles[1].maxWidth+'%' : ci === index+1 ? styles[2].maxWidth+'%' : styles[0].maxWidth+'%',
      maxHeight: ci === index ? styles[1].maxHeight+'%'+'px' : ci === index+1 ? styles[2].maxHeight+'px' : styles[0].maxHeight+'px',
      height: isMini(ci) ? 'auto' : '100%'
    }`).row.full-width.items-center.content-center
    composition(
      :ctx="ctx"
      :value="c.composition" :preview="c.preview"
      :visible="visible && ci >= index-1 && ci <= index+1"
      :active="active && ci === index"
      :mini="isMini(ci)"
      :style=`{borderRadius: '10px', overflow: 'hidden'}`
      @compositionGet="compositionGet(c, ci)"
      @next="compositionNext(ci)"
      @error="$event => compositionError(ci, $event)")
      //- @ended="compositionNext(ci + 1)"
  //- preview list
  div(
    v-if="true && ctx === 'rubick'"
    :style=`{position: 'absolute', top: '20px', zIndex: 3500}`).row.full-width.scroll.q-pa-sm
    .row.full-width.no-wrap
      div(
        v-for="(c, ci) in compositionsFiltered" :key="ci"
        :style=`{width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden',
        border: c.node.oid === nodeOid ? '2px solid pink' : '1px solid red'}`
        ).bg-black.q-mr-sm
        img(
          :src="c.preview"
          :style=`{
            borderRadius: '10px', overflow: 'hidden', userSelect: 'none', objectFit: 'contain',
            border: ci === index ? '2px solid #4caf50' : '2px solid rgba(0,0,0,0)'}`
          draggable="false").fit
  //- preview node list...
  div(
    v-if="true && ctx === 'rubick'"
    :style=`{position: 'absolute', top: '70px', zIndex: 3500}`).row.full-width.scroll.q-pa-sm
    .row.full-width.no-wrap
      div(
        v-for="(c, ci) in compositionsFiltered" :key="ci"
          :style=`{width: '40px', height: '80px',
            borderRadius: '10px', border: ci === index ? '2px solid #4caf50' : '2px solid rgba(0,0,0,0)',
            }`).bg-black.q-mr-sm
        div(:style=`{height: '40px'}`).row.full-width
          img(
            :src="c.node.meta.compositions[0].thumbUrl" draggable="false"
            :style=`{
              borderRadius: '10px', overflow: 'hidden', userSelect: 'none', objectFit: 'contain'}`).fit
        div(:style=`{height: '40px'}`).row.full-width
          img(
            :src="c.node.meta.compositions[1].thumbUrl" draggable="false"
            :style=`{
              borderRadius: '10px', overflow: 'hidden', userSelect: 'none', objectFit: 'contain'}`).fit
</template>

<script>
export default {
  name: 'compositionList',
  props: {
    ctx: {type: String},
    mode: {type: String, default () { return 'manual' }},
    visible: {type: Boolean, default () { return false }},
    active: {type: Boolean, default () { return false }},
    compositions: {type: Array},
    compositionOid: {type: String},
    nodeOid: {type: String}
  },
  data () {
    return {
      index: 0,
      indexErrored: [],
      indexNexting: -1,
      height: 0,
      width: 0,
      stylesInitial: [
        {zIndex: 300, maxWidth: 25, maxHeight: 100, opacity: 0.7},
        {zIndex: 200, maxWidth: 100, maxHeight: 100, opacity: 1},
        {zIndex: 300, maxWidth: 25, maxHeight: 100, opacity: 0.7}
      ],
      styles: [],
      preview: undefined,
      compositionsFiltered: []
    }
  },
  watch: {
    compositions: {
      immediate: true,
      handler (to, from) {
        // this.$log('compositions CHANGED', to)
        // if ()
        if (this.ctx === 'rubick') {
          if (to) {
            this.compositionsFiltered = to.sort((a, b) => {
              if (a.node.oid === this.nodeOid) return -1
              else return 1
            })
            if (from) this.index = 0
          }
        }
        else {
          this.compositionsFiltered = to
        }
      }
    }
  },
  methods: {
    play () {
      this.$log('play')
    },
    pause () {
      this.$log('pause')
    },
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
      // this.$q.notify('previewLoad')
      // this.$q.emit('previewLoad')
      // TODO list height? screen/3?, screen.width?, previewClientWidth?
      // this.height = this.$refs.compositionListPreview.clientHeight
      this.height = this.$refs.compositionListPreview.clientHeight > this.$q.screen.height / 3 ? this.$refs.compositionListPreview.clientHeight : this.$q.screen.height / 3
      this.width = this.$refs.compositionListPreview.clientWidth
      this.stylesInitial[1].maxHeight = this.height
      this.styles = JSON.parse(JSON.stringify(this.stylesInitial))
      this.$emit('height', this.height)
      this.$emit('width', this.width)
      // this.$q.notify('height', this.height)
    },
    previewError (e) {
      // this.$log('previewError', e)
      this.$emit('error', 'previewError')
      this.$q.notify('previewError')
    },
    compositionStyle (ci) {
      if (ci > this.index) return {right: '0px'}
      else if (ci < this.index) return {left: '0px'}
    },
    async compositionGet (c, ci) {
      this.$log('compositionGet', c, ci)
      let nodeFull = await this.$store.dispatch('objects/get', { oid: c.node.oid, priority: 0 })
      this.$log('compositionGet: nodeFull', nodeFull)
      c.composition = nodeFull.compositions[c.compositionIndex]
    },
    compositionNext (index) {
      this.$log('compositionNext', index)
      if (this.nodeNexting >= 0) return
      if (!this.compositions[index]) {
        // this.index = 0
        // this.compositionNext(0)
        // this.indexNexting = 0
      } else {
        // this.$emit('next', index)
        this.indexNexting = index
        let i = index > this.index ? 2 : 0
        // this.$log('i', i)
        this.$tween.to(
          this.styles[1],
          0.5,
          {
            opacity: 0,
            onComplete: () => {
              // this.$set(this.styles, 1, JSON.parse(JSON.stringify(this.stylesInitial[1])))
            }
          }
        )
        this.$tween.to(
          this.styles[i],
          0.5,
          {
            zIndex: 300,
            maxWidth: 100,
            maxHeight: this.height,
            opacity: 1,
            onComplete: () => {
              this.$set(this, 'styles', JSON.parse(JSON.stringify(this.stylesInitial)))
              this.index = index
              this.indexNexting = -1
              this.$emit('next', index)
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
