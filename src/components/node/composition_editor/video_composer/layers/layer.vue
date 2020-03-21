<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '160px',
    borderRadius: '10px'
  }`
  ).row.full-width.items-start.content-start.bg-grey-9
  //- default header
  div(:style=`{height: '36px'}`).row.full-width.items-center.content-center
    span(v-if="layerName").text-white.cursor-pointer.q-ml-md {{ layerName || 'Set layer name' }}
      q-menu(ref="layerMenu" max-width="200px" anchor="center right" self="center left")
        layer-menu(
          :layer="layer" :index="index"
          @hide="$refs.layerMenu.hide()" @layerDelete="$emit('layerDelete')")
    .col
      .row.fit.items-center.content-center.justify-end.q-px-md
        span.text-white {{$time(layer.figuresAbsolute[0].t)}}-{{$time(layer.figuresAbsolute[1].t)}} / {{ $time(layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t) }}
  //- ACTIVE layer
  div(
    :style=`{position: 'relative', height: 110+'px', overflow: 'hidden'}`).row.full-width.items-start.content-start
    //- PLAYER progress
    div(:style=`{height: '60px'}`).row.full-width
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
    //- TICKS
    div(:style=`{height: '44px'}`).row.full-width.justify-center.content-center.items-center.q-px-xs
      q-btn(round push @click="layerPlayButtonClick()"
        :color="meta.mode === 'layer' && meta.playing ? 'red' : 'green'"
        :icon="meta.playing && layerActive ? 'pause' : 'play_arrow'").q-mr-md
      div(:style=`{borderRadius: '30px'}`).row.full-height.items-center.content-center.bg-grey-7.q-pa-xs.q-mr-xs
        q-btn(round flat dense no-caps color="white" icon="keyboard_arrow_left" @click="layerTick(0, 0)").q-mr-lg
        q-btn(round flat dense no-caps color="white" icon="keyboard_arrow_right" @click="layerTick(0, 1)")
      //- .col.full-height
      div(:style=`{borderRadius: '30px'}`).row.full-height.items-center.content-center.bg-grey-7.q-pa-xs.q-ml-xs
        q-btn(round flat dense no-caps color="white" icon="keyboard_arrow_left" @click="layerTick(1, 0)").q-mr-lg
        q-btn(round flat dense no-caps color="white" icon="keyboard_arrow_right" @click="layerTick(1, 1)")
      q-btn(round flat color="white" icon="refresh" @click="player.setCurrentTime(layer.figuresAbsolute[0].t)").q-ml-md
    //- ACTIONS: delete, copy, share, save
    div(v-if="false").row.full-width.items-center.content.center.justify-center.q-px-lg
      q-btn(round flat icon="delete_outline" color="red" @click="$emit('layerDelete', index)").q-mr-sm
      //- .col.full-height
      q-btn(round flat icon="favorite_border" color="white" @click="layerLove()").q-ml-sm
</template>

<script>
import layerMenu from './layer_menu'

export default {
  name: 'videoComposer_layersLayer',
  props: ['index', 'layer', 'player', 'meta'],
  components: {layerMenu},
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
            if (this.height !== 165) this.$tween.to(this, 0.3, {height: 104})
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
      try {
        // this.$log('layerProgressClick', e)
        // this.$q.notify('layerProgressClick')
        let width = e.target.clientWidth
        let offsetX = e.offsetX
        let k = offsetX / width
        let d = this.layer.figuresAbsolute[1].t - this.layer.figuresAbsolute[0].t
        let to = this.layer.figuresAbsolute[0].t + (k * d)
        // this.$q.notify(`${width}, ${offsetX}, ${k}, ${d}, ${to}`)
        this.$emit('meta', ['videoUpdate', to])
        this.player.setCurrentTime(to)
      }
      catch (e) {
        this.$log('layerProgressClick error', e)
        this.$q.notify({message: 'layerProgressClick error' + e, color: 'red', textColor: 'white'})
      }
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
