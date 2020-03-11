<style lang="stylus">
.kinput {
  border: none;
  height: 100%;
  padding: 10px;
  &:focus {
    outline: none;
  }
}
.kbtn {
  border-radius: 10px
}
</style>
<template lang="pug">
.column.fit
  //- dialogs
  q-dialog(v-model="dialogNameShow" :maximized="$q.screen.xs")
    .column.fit.bg-white
      div(:style=`{minHeight: '60px'}`).row.full-width
        input(v-model="layerName").fit.kinput
      .col.full-width
      div(:style=`{height: '60px'}`).row.full-width.q-pa-sm
        q-btn(push no-caps color="green" @click="dialogNameShow = false, layer.spheres[0] = {name: layerName}, layerName = ''").full-width
          span.text-bold Save
  //- header
  div(
    :style=`{height: '60px', order: 1000}`
    ).row.full-width
    .col.full-height
      .row.fit.items-center.justify-start.q-px-sm
        q-btn(
          round push color="green" icon="play_arrow")
    .col.full-height
      .row.fit.items-center.justify-end.q-px-sm
        span(
          :class=`{
            'text-red': compositionLength > 60,
            'text-white': compositionLength < 60}`
          ).text-bold Total length: {{ $time(compositionLength) }}
  //- body
  div(
    ref="layersScrollWrapper"
    :style=`{position: 'relative'}`).col.full-width.scroll
    div(
      :style=`{marginTop: $q.screen.height/2+'px', marginBottom: $q.screen.height/2+'px'}`
      ).row.full-width.items-start.content-start.q-pa-sm
      div(
        v-for="(l, li) in layers" :key="li" :ref="'layer-'+li"
        v-if="l.figuresAbsolute.length > 0"
        :class=`{
          'bg-grey-10': meta.mode === 'watch' || li !== meta.layerIndex,
          'bg-grey-8': meta.mode !== 'watch' && li === meta.layerIndex}`
        :style=`{position: 'relative', minHeight: '40px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.q-mb-sm
        //- inactive tint
        div(
          v-if="meta.mode === 'watch' || meta.layerIndex !== li" @click="layerClick(l, li)"
          :style=`{position: 'absolute', zIndex: 200, opacity: 0.3}`
          ).row.fit.cursor-pointer.bg-black
        //- inactive layer
        div(
          v-if="l.figuresAbsolute.length > 0"
          :style=`{height: '40px'}`
          ).row.full-width.items-center.content-center
          .col.full-height
            //- name SHOW
            div(
              v-if="li !== layerNameSetting"
              :style=`{paddingLeft: '20px'}`
              ).row.fit.items-center.content-center
              div(v-if="l.spheres.length > 0").col.full-height
                div().row.fit.items-center.content-center
                  span(
                    v-if="l.spheres.length > 0"
                    @click="layerName = l.spheres[0].name, dialogNameShow = true"
                    ).text-white.cursor-pointer {{ l.spheres[0].name }}
              //- q-btn(v-if="li === meta.layerIndex" round flat dense color="white" icon="edit" @click="layerNameSetStart(l,li)").q-mx-sm
              span(
                v-if="li === meta.layerIndex && l.spheres.length === 0"
                @click="dialogNameShow = true"
                ).text-grey-5.cursor-pointer Click to set layer name
            //- //- name EDIT
            //- div(
            //-   v-if="li === layerNameSetting"
            //-   :style=`{borderRadius: '10px', overflow: 'hidden'}`).row.fit.items-center.content-center.bg-green
            //-   .col.full-height
            //-     .row.fit.items-center.content-center
            //-       input(
            //-         v-model="layerName"
            //-         autofocus
            //-         @keyup.enter="layerNameSet(l,li)" @blur="layerNameSet(l, li)"
            //-         :style=`{background: 'none', color: 'white'}`).kinput.full-width
            //-   q-btn(v-if="li === meta.layerIndex" round flat dense color="white" icon="check" @click="layerNameSet(l,li)").q-mx-sm
          .row.full-height.items-center.content-center.q-px-md
            .row.full-height.justify-center.items-center.content-center
              span.text-white {{ $time(l.figuresAbsolute[0].t) }}
            span.text-white.q-mx-sm -
            .row.full-height.justify-center.items-center.content-center
              span.text-white {{ $time(l.figuresAbsolute[1].t) }}
        //- active layer
        div(
          v-if="meta.mode !== 'watch' && meta.layerIndex === li"
          :style=`{}`
          ).row.full-width.items-start.content-start.justify-start
          //- spheres
          .row.full-width.q-px-lg.q-py-sm
            small(
              v-for="(s,si) in l.spheres" :key="si"
              :style=`{borderRadius: '20px'}`).text-white.q-py-xs.q-px-sm.bg-grey-7.q-mr-sm.q-mb-sm {{ s.name }}
            div(:style=`{width: '24px', height: '24px', borderRadius: '12px'}`).row.items-center.content-center.justify-center.cursor-pointer.bg-green
              q-icon(color="white" name="add")
          //- play, progress, total
          div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-xs
            div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
              q-btn(
                push round no-caps @click="meta.playing ? player.pause() : player.play()"
                :color="meta.playing && meta.layerIndex === li ? 'red' : 'green'"
                :icon="meta.playing && meta.layerIndex === li ? 'pause' : 'play_arrow'"
                :style=`{}`)
            .col.full-height
              .row.fit.items-center.content-center
                div(
                  @click="layerProgressClick"
                  :style=`{position: 'relative', height: '44px', borderRadius: '20px', overflow: 'hidden'}`).row.full-width.bg-grey-9.q-pa-xs
                  //- progress
                  div(:style=`{
                    position: 'absolute', zIndex: 200,
                    //- borderRadius: layerPersent > 99.9 ? '30px' : '30px 0 0 30px',
                    borderRadius: '30px', pointerEvents: 'none',
                    width: 'calc('+layerPersent+'% - 8px)',
                    height: 'calc(100% - 8px)'}`).row.bg-grey-4
            div(:style=`{height: '60px', width: '60px'}`).row.items-center.conent-center.justify-center
              q-btn(round flat color="white" icon="more_vert" @click="layerMore()")
          //- ticks
          div(:style=`{height: '44px'}`).row.full-width.justify-center.content-center.items-center.q-px-md.q-mt-sm.q-mb-md
            div(:style=`{borderRadius: '30px'}`).row.full-height.items-center.content-center.bg-grey-7.q-pa-xs
              q-btn(round flat dense no-caps color="green" icon="keyboard_arrow_left" @click="layerTick(0, 0)").q-mr-lg
              q-btn(round flat dense no-caps color="green" icon="keyboard_arrow_right" @click="layerTick(0, 1)")
            .col.full-height
              .row.fit.items-center.content-center.justify-center
                span.text-white {{ $time(l.figuresAbsolute[1].t-l.figuresAbsolute[0].t) }}
                .row.full-width.justify-center.text-grey-5
                  small Total
            div(:style=`{borderRadius: '30px'}`).row.full-height.items-center.content-center.bg-grey-7.q-pa-xs
              q-btn(round flat dense no-caps color="green" icon="keyboard_arrow_left" @click="layerTick(1, 0)").q-mr-lg
              q-btn(round flat dense no-caps color="green" icon="keyboard_arrow_right" @click="layerTick(1, 1)")
          //- actions: delete, copy, share, save
          div(v-if="true").row.full-width.q-px-md.q-py-xs
            q-btn(flat no-caps color="red" @click="layerDelete(li)"
              :style=`{borderRadius: '10px'}`)
              span.text-bold Delete
            .col.full-height
            q-btn(flat no-caps color="green"
              :style=`{borderRadius: '10px'}`)
              span.text-bold Save to composition
          //- active layer PICK
          div(
            v-if="mode === 'pick'"
            :style=`{height: '50px'}`).row.full-width.items-center.content-center.justify-between
            q-btn(dense no-caps color="green" @click="layerExport(l, li)").q-px-sm Export
</template>

<script>
export default {
  name: 'editorVideoLayers',
  props: ['mode', 'layers', 'composition', 'player', 'meta'],
  data () {
    return {
      height: 220,
      layerNameSetting: -1,
      layerName: '',
      dialogNameShow: false
    }
  },
  computed: {
    layersFiltered () {
      return this.layers.filter(l => {
        return l.figuresAbsolute.length > 0
        // return true
      })
    },
    layer () {
      return this.layers[this.meta.layerIndex]
    },
    layerPersent () {
      if (!this.layer) return 0
      let dNow = this.meta.now - this.layer.figuresAbsolute[0].t
      let dAll = this.layer.figuresAbsolute[1].t - this.layer.figuresAbsolute[0].t
      return (dNow / dAll) * 100
    },
    modeName () {
      switch (this.meta.mode) {
        case 'play': {
          return 'Playing all layers'
        }
        case 'watch': {
          return 'Just watching...'
        }
        case 'layer': {
          let name = this.layer.spheres.length > 0 ? this.layer.spheres[0].name : this.meta.layerIndex + 1
          return `Playing layer: ${name}`
        }
        default: {
          return 'Nothing'
        }
      }
    },
    compositionLength () {
      return this.layersFiltered.reduce((acc, l) => {
        return acc + (l.figuresAbsolute[1].t - l.figuresAbsolute[0].t)
      }, 0)
    }
  },
  watch: {
    'meta.layerIndex': {
      immediate: true,
      handler (to, from) {
        this.$log('meta.layerIndex CHANGED', to)
        this.layerNameSetting = false
        this.layerName = ''
        if (to >= 0) this.layerScrollTo(to)
      }
    }
  },
  methods: {
    playPause () {
      this.$log('playPause', this.meta.mode)
      if (this.meta.mode === 'watch') {
        this.$emit('meta', ['mode', 'play'])
        this.$emit('meta', ['layerIndex', 0])
        this.$emit('meta', ['layerIndexPlay', -1])
        this.player.play()
      }
      else {
        this.$emit('meta', ['mode', 'watch'])
        this.$emit('meta', ['layerIndex', 0])
        this.$emit('meta', ['layerIndexPlay', -1])
      }
    },
    layerClick (l, li) {
      this.$log('layerClick', l, li)
      if (this.mode === 'edit') {
        this.$emit('meta', ['mode', 'layer'])
        this.$emit('meta', ['layerIndexPlay', li])
      }
      else if (this.mode === 'pick') {
        this.$emit('pick', JSON.parse(JSON.stringify(this.layers[li])))
      }
    },
    layerMore () {
      this.$log('layerMore')
    },
    layerProgressClick (e) {
      this.$log('layerProgressClick', e)
      let width = e.path[0].clientWidth
      let offsetX = e.offsetX
      let k = offsetX / width
      let d = this.layer.figuresAbsolute[1].t - this.layer.figuresAbsolute[0].t
      let to = this.layer.figuresAbsolute[0].t + (k * d)
      this.player.setCurrentTime(to)
    },
    layerTick (index, forward) {
      this.$log('layerTick', index, forward)
      let from = this.layer.figuresAbsolute[index].t
      let to = forward ? from + 0.100 : from - 0.100
      this.layer.figuresAbsolute[index].t = to
      this.player.pause()
      this.player.setCurrentTime(to)
    },
    async layerScrollTo (li) {
      this.$log('layerScrollTo')
      await this.$wait(150)
      let l = this.$refs[`layer-${li}`][0]
      let offset = l.offsetTop - 30
      this.$tween.to(this.$refs.layersScrollWrapper, 0.5, {scrollTop: offset})
    },
    layerExport (l, li) {
      this.$log('layerExport', l, li)
    },
    layerPlay () {
      this.$log('layerPlay')
    },
    async layerDelete (li) {
      this.$log('layerDelete')
      if (this.layers.length > 1) {
        if (!confirm('Delete layer?')) return
        let index = li === 0 ? this.meta.layerIndex + 1 : this.meta.layerIndex - 1
        this.$emit('meta', ['mode', 'layer'])
        this.$emit('meta', ['layerIndex', index])
        this.$emit('meta', ['layerIndexPlay', index])
        // await this.$wait(300)
        this.$delete(this.layers, li)
      }
    },
    layerNameSetStart (l, li) {
      this.$log('layerNameSetStart', l, li)
      this.layerNameSetting = li
      this.layerName = l.spheres.length > 0 ? l.spheres[0].name : ''
      this.$log('layerNameSetStart name', this.layerName)
    },
    layerNameSet (l, li) {
      this.$log('layerNameSet', l, li)
      this.$log('layerNameSet name', this.layerName)
      if (this.layerName.length === 0) {
        this.$set(l, 'spheres', [])
      }
      else {
        this.$set(l.spheres, 0, {name: this.layerName})
      }
      // this.layerName = ''
      this.layerNameSetting = -1
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
