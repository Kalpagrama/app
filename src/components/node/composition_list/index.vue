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
    v-if="false"
    :style=`{position: 'absolute', zIndex: 4000, top: '4px', right: 'calc(50% - 20px)', borderRadius: '10px', background: 'rgba(0,0,0,0.3)',
      userSelect: 'none'}`
    ).text-white.q-pa-xs {{ index + 1 }}/{{ compositions.length }}
  //- preview
  img(
    v-if="true"
    ref="compositionListPreview"
    :src="preview" @load="previewLoad" @error="previewError"
    draggable="false"
    :style=`{position: 'relative', width: '100%', objectFit: 'contain', opacity: 0, userSelect: 'none'}`)
  //- compositions
  div(
    v-for="(c, ckey) in rubick" :key="ckey"
    v-if="rubick && height > 0"
    :style=`{
      position: 'absolute', bottom: 0, ...compositionRightLeft(ckey), borderRadius: '10px', overflow: 'hidden',
      zIndex: ckey === 'current' ? 200 : 300,
      opacity: rubickStyles[ckey].opacity,
      maxWidth: rubickStyles[ckey].maxWidth+'%',
      maxHeight: rubickStyles[ckey].maxHeight+'px',
      height: isMini(ckey) ? 'auto' : '100%'
    }`
    ).row.full-width.items-center.content-center
    composition(
      v-if="c"
      :ctx="ctx"
      :value="c.composition" :preview="c.preview"
      :visible="visible" :active="active && ckey === 'current'" :mini="isMini(ckey)"
      @next="compositionNext(ckey)"
      @compositionGet="compositionGet(c, ci)")
      //- ckey === 'current'
  //- preview list
  div(
    v-if="true && ctx === 'rubick'"
    :style=`{position: 'absolute', top: '4px', zIndex: 3500, pointerEvents: 'none'}`).row.full-width.scroll.q-px-sm
    div(
      v-for="(c,ci) in compositions" :key="ci"
      :style=`{height: '4px'}`
      ).col.q-px-xs
      div(
        :class=`{'bg-green': ci === index, 'bg-grey-10': ci !== index}`
        :style=`{borderRadius: '2px',overflow: 'hidden'}`
        ).row.fit
  //- preview compositions
  div(
    v-if="true && ctx === 'rubick'"
    :style=`{position: 'absolute', top: '4px', zIndex: 3500, pointerEvents: 'none', opacity: 0.5}`).row.full-width.scroll.q-pa-sm
    .row.full-width.no-wrap
      div(
        v-for="(c, ci) in compositions" :key="ci"
        :style=`{width: '30px', height: '30px', borderRadius: '10px', overflow: 'hidden',
        border: c.node.oid === nodeOid ? '2px solid pink' : '1px solid red'}`
        ).bg-black.q-mr-sm
        img(
          :src="c.preview"
          :style=`{
            borderRadius: '10px', overflow: 'hidden', userSelect: 'none', objectFit: 'contain',
            border: ci === index ? '2px solid #4caf50' : '2px solid rgba(0,0,0,0)'}`
          draggable="false").fit
  //- preview nodes
  div(
    v-if="true && ctx === 'rubick'"
    :style=`{position: 'absolute', top: '40px', zIndex: 3500, pointerEvents: 'none', opacity: 0.5}`).row.full-width.scroll.q-pa-sm
    .row.full-width.no-wrap
      div(
        v-for="(c, ci) in compositions" :key="ci"
          :style=`{width: '30px', height: '60px',
            borderRadius: '10px', border: ci === index ? '2px solid #4caf50' : '2px solid rgba(0,0,0,0)',
            }`).bg-black.q-mr-sm
        div(:style=`{height: '30px'}`).row.full-width
          img(
            :src="c.node.meta.compositions[0].thumbUrl" draggable="false"
            :style=`{
              borderRadius: '10px', overflow: 'hidden', userSelect: 'none', objectFit: 'contain'}`).fit
        div(:style=`{height: '30px'}`).row.full-width
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
      ckeyNexting: undefined,
      height: 0,
      width: 0,
      preview: undefined,
      compositionOidOld: undefined,
      rubick: null,
      rubickStylesInitial: {
        prev: {zIndex: 300, maxWidth: 25, maxHeight: 100, opacity: 0.7},
        current: {zIndex: 200, maxWidth: 100, maxHeight: 100, opacity: 1},
        next: {zIndex: 300, maxWidth: 25, maxHeight: 100, opacity: 0.7}
      },
      rubickStyles: {}
    }
  },
  watch: {
    compositions: {
      immediate: true,
      handler (to, from) {
        // this.$log('cCHANGED', to)
        if (to) {
          if (this.ctx === 'rubick') {
            if (from) {
              // this.$log('cCHANGED FROM')
              this.index = to.findIndex(i => i.node.oid === this.nodeOid)
              // this.$log('cCHANGED index', this.index)
              if (this.index >= 0) {
                this.rubick.prev = this.index > 0 ? to[this.index - 1] : null
                this.rubick.next = this.index < to.length ? to[this.index + 1] : null
                // this.rubick.current = to[this.index]
                if (to[this.index].compositionOid !== this.compositionOidOld) {
                  this.rubick.current = to[this.index]
                  this.compositionOidOld = this.compositionOid
                }
              }
            }
            else {
              // this.$log('cCHANGED NEW')
              this.index = to.findIndex(i => i.node.oid === this.nodeOid)
              // this.$log('cCHANGED index', this.index)
              if (this.index >= 0) {
                if (!this.preview) this.preview = to[this.index].preview
                this.rubick = {
                  prev: this.index > 0 ? to[this.index - 1] : null,
                  current: to[this.index],
                  next: this.index < to.length ? to[this.index + 1] : null
                }
              }
            }
          }
          else {
            if (!this.preview) this.preview = to[0].preview
            this.rubick = {
              prev: null,
              current: to[0],
              next: to[1]
            }
          }
        }
      }
    }
  },
  methods: {
    compositionNext (ckey) {
      this.$log('compositionNext', ckey)
      this.$log('compositionNext this.index', this.index)
      this.$log('compositionNext compositions.length ', this.compositions.length)
      let index
      if (ckey === 'next' && this.index + 1 < this.compositions.length) {
        index = this.index + 1
      }
      if (ckey === 'prev' && this.index - 1 >= 0) {
        index = this.index - 1
      }
      this.$log('compositionNext index', index)
      this.$log('compositionNext this.index', this.index)
      if (index === undefined) return
      this.ckeyNexting = ckey
      this.$tween.to(this.rubickStyles.current, 0.5, {opacity: 0})
      this.$tween.to(
        this.rubickStyles[ckey],
        0.5,
        {
          zIndex: 300,
          maxWidth: 100,
          maxHeight: this.height,
          opacity: 1,
          onComplete: () => {
            this.$set(this, 'rubickStyles', JSON.parse(JSON.stringify(this.rubickStylesInitial)))
            this.ckeyNexting = undefined
            if (this.ctx === 'rubick') {
              this.compositionOidOld = this.rubick[ckey].compositionOid
              let t = this.rubick.current
              this.rubick.current = this.rubick[ckey]
              this.rubick[ckey] = t
              this.index = index
              this.$emit('next', index)
            }
            else {
              let t = this.rubick.current
              this.rubick.current = this.rubick[ckey]
              if (ckey === 'next') {
                this.rubick.prev = t
                this.rubick.next = null
              }
              else {
                this.rubick.next = t
                this.rubick.prev = null
              }
              this.index = index
              this.$emit('next', index)
            }
          }
        }
      )
    },
    play () {
      this.$log('play')
    },
    pause () {
      this.$log('pause')
    },
    handleSwipe (e) {
      this.compositionNext(e.direction === 'left' ? 'next' : 'prev')
    },
    isMini (ckey) {
      return ckey === this.ckeyNexting ? false : ckey !== 'current'
    },
    previewLoad (e) {
      // this.$log('previewLoad', e)
      // TODO list height? screen/3?, screen.width?, previewClientWidth?
      // this.height = this.$refs.compositionListPreview.clientHeight
      this.height = this.$refs.compositionListPreview.clientHeight > this.$q.screen.height / 3 ? this.$refs.compositionListPreview.clientHeight : this.$q.screen.height / 3
      this.width = this.$refs.compositionListPreview.clientWidth
      this.rubickStylesInitial.current.maxHeight = this.height
      this.rubickStyles = JSON.parse(JSON.stringify(this.rubickStylesInitial))
      this.$emit('height', this.height)
      this.$emit('width', this.width)
    },
    previewError (e) {
      // this.$log('previewError', e)
      this.$emit('error', 'previewError')
    },
    compositionRightLeft (ckey) {
      if (ckey === 'next') return {right: '0px'}
      if (ckey === 'prev') return {left: '0px'}
    },
    async compositionGet (c) {
      this.$log('compositionGet', c)
      let nodeFull = await this.$store.dispatch('objects/get', { oid: c.node.oid, priority: 0 })
      this.$log('compositionGet: nodeFull', nodeFull)
      c.composition = nodeFull.compositions[c.compositionIndex]
    }
  }
}
</script>
