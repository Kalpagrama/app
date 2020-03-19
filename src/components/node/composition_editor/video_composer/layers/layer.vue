<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px'
  }`
  ).row.full-width.q-mb-xs.bg-grey-9
  //- dialogs
  //- layerName
  q-dialog(v-model="layerNameDialogOpened" :maximized="$q.screen.xs" @hide="layerNameSet")
    div(
      :style=`{
        maxHeight: $q.screen.xs ? '100%' : '200px',
        maxWidth: $q.screen.xs ? '100%' : '300px',
        borderRadius: '10px'
      }`).column.fit.bg-white
      div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
        span.text-bold.text-black Set layer name
      div(:style=`{height: '60px'}`).row.full-width.q-px-sm
        input(
          v-model="layerNameInput"
          autofocus placeholder="Suggest layer name"
          @keyup.enter="layerNameSet"
          :style=`{borderRadius: '10px'}`).kinput.full-width.bg-grey-4
      .col.full-width
      div(:style=`{height: '70px'}`).row.full-width.q-pa-sm
        q-btn(push color="green" no-caps @click="layerNameSet"
          :style=`{borderRadius: '10px'}`).fit
          span Save
  //- default header
  div(:style=`{height: '36px'}`).row.full-width.items-center.content-center
    span(v-if="layerName" @click="layerNameSetStart").text-white.cursor-pointer.q-ml-md {{ layerName }}
    span(v-if="layerActive && !layerName" @click="layerNameSetStart").text-white.cursor-pointer.q-ml-md Set layer name
    .col
      .row.fit.items-center.content-center.justify-end.q-px-md
        span.text-white {{$time(layer.figuresAbsolute[0].t)}}-{{$time(layer.figuresAbsolute[1].t)}} / {{ $time(layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t) }}
    div(:style=`{height: '36px', width: '36px'}`).row.items-center.content-center.justify-center.cursor-pointer
      q-icon(color="white" size="20px" name="drag_indicator")
  //- ACTIVE layer
  div(
    :style=`{position: 'relative', height: height+'px', overflow: 'hidden'}`).row.full-width.items-start.content-start
    //- PLAYER progress
    div(:style=`{height: '60px'}`).row.full-width
      //- div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
      //-   q-btn(round push @click="layerPlayButtonClick()"
      //-     :color="meta.mode === 'layer' && meta.playing ? 'red' : 'green'"
      //-     :icon="meta.playing && layerActive ? 'pause' : 'play_arrow'")
      .col.full-height.q-px-md
        .row.fit.items-center.content-center
          //- progress wrapper
          div(
            @click="layerProgressClick"
            :style=`{position: 'relative', height: '20px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.bg-grey-8.cursor-pointer
            //- progress bar white
            div(
              v-show="!meta.editing"
              :style=`{
                position: 'absolute', left: '0px', top: '0px',
                height: 'calc(100% - 0px)',
                width: 'calc(' + layerPercent + '% - 0px)',
                borderRadius: 'none',
                pointerEvents: 'none'}`
              ).row.bg-grey-4
            div(:style=`{position: 'absolute',
              left: 'calc('+layerPercent+'% - 10px)',
              width: '20px', height: '20px', borderRadius: '50%'}`).bg-green
      //- div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
      //-   q-btn(round flat color="white" icon="refresh" @click="player.setCurrentTime(layer.figuresAbsolute[0].t)")
    //- TICKS
    div(:style=`{height: '44px'}`).row.full-width.justify-center.content-center.items-center.q-px-md
      q-btn(round push @click="layerPlayButtonClick()"
        :color="meta.mode === 'layer' && meta.playing ? 'red' : 'green'"
        :icon="meta.playing && layerActive ? 'pause' : 'play_arrow'").q-mr-md
      div(:style=`{borderRadius: '30px'}`).row.full-height.items-center.content-center.bg-grey-7.q-pa-xs
        q-btn(round flat dense no-caps color="white" icon="keyboard_arrow_left" @click="layerTick(0, 0)").q-mr-lg
        q-btn(round flat dense no-caps color="white" icon="keyboard_arrow_right" @click="layerTick(0, 1)")
      .col.full-height
        .row.fit.items-center.content-center.justify-center
          span.text-white {{ $time(layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t) }}
          .row.full-width.justify-center.text-grey-5
            small Total
      div(:style=`{borderRadius: '30px'}`).row.full-height.items-center.content-center.bg-grey-7.q-pa-xs
        q-btn(round flat dense no-caps color="white" icon="keyboard_arrow_left" @click="layerTick(1, 0)").q-mr-lg
        q-btn(round flat dense no-caps color="white" icon="keyboard_arrow_right" @click="layerTick(1, 1)")
      q-btn(round flat color="white" icon="refresh" @click="player.setCurrentTime(layer.figuresAbsolute[0].t)").q-ml-md
    //- ACTIONS: delete, copy, share, save
    div(v-if="true").row.full-width.items-center.content.center.q-px-lg
      q-btn(round flat icon="delete_outline" color="red" @click="$emit('layerDelete', index)")
      .col.full-height
      q-btn(round flat icon="favorite_border" color="white" @click="layerLove()")
</template>

<script>
export default {
  name: 'videoComposer_layersLayer',
  props: ['index', 'layer', 'player', 'meta'],
  data () {
    return {
      height: 0,
      layerNameInput: '',
      layerNameDialogOpened: false
    }
  },
  computed: {
    layerName () {
      if (this.layer.spheres.length > 0) {
        return this.layer.spheres[0].name
      } else {
        return false
      }
    },
    layerActive () {
      return this.meta.layerIndexPlay === this.index
    },
    layerOver () {
      if (this.meta.now >= this.layer.figuresAbsolute[0].t && this.meta.now <= this.layer.figuresAbsolute[1].t) {
        return true
      }
      else {
        return false
      }
    },
    layerPercent () {
      if (!this.layer) return 0
      let dNow = this.meta.now - this.layer.figuresAbsolute[0].t
      let dAll = this.layer.figuresAbsolute[1].t - this.layer.figuresAbsolute[0].t
      return (dNow / dAll) * 100
    }
  },
  watch: {
    layerActive: {
      immediate: true,
      async handler (to, from) {
        this.$log(this.index, 'layerActive CHANGED', to, from)
        if (to) {
          if (to !== from) {
            if (this.height !== 165) this.$tween.to(this, 0.3, {height: 150})
            // this.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
          }
        }
        else {
          if (this.height !== 0) this.$tween.to(this, 0.3, {height: 0})
        }
      }
    }
  },
  methods: {
    layerNameSetStart (index) {
      this.$log('layerNameSetStart')
      if (this.layer.spheres.length > 0) {
        this.layerNameInput = this.layer.spheres[0].name
      }
      this.layerNameDialogOpened = true
    },
    layerNameSet () {
      this.$log('layerNameSet')
      this.layerNameDialogOpened = false
      if (this.layerNameInput.length === 0) return
      this.$set(this.layer.spheres, 0, {name: this.layerNameInput})
      this.layerNameInput = ''
      this.layerNameSetIndex = -1
    },
    layerPlayButtonClick () {
      this.$log('layerPlayButtonClick')
      this.$emit('meta', ['mode', 'layer'])
      this.$emit('meta', ['layerIndex', this.index])
      this.$emit('meta', ['layerIndexPlay', this.index])
      if (this.meta.playing) this.player.pause()
      else this.player.play()
    },
    layerTick (index, forward) {
      this.$log('layerTick', index, forward)
      let from = this.layer.figuresAbsolute[index].t
      let to = forward ? from + 0.100 : from - 0.100
      this.layer.figuresAbsolute[index].t = to
      this.player.pause()
      this.player.setCurrentTime(to)
    },
    layerProgressClick (e) {
      // this.$log('layerProgressClick', e)
      let width = e.path[0].clientWidth
      let offsetX = e.offsetX
      let k = offsetX / width
      let d = this.layer.figuresAbsolute[1].t - this.layer.figuresAbsolute[0].t
      let to = this.layer.figuresAbsolute[0].t + (k * d)
      this.player.setCurrentTime(to)
    },
    layerProgressPan (e) {
      this.$log('layerProgressPan', e)
    },
    layerLove () {
      this.$log('layerLove')
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
