<style lang="sass" scoped>
.content-header
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.full-width.items-start.content-start.b-70
  //- header
  div(
    :class=`{
      'b-90': stateExplorer.compositionSelected === value.id,
    }`
    :style=`{
      position: 'relative',
      height: '40px',
      borderRadius: '10px',
      overflow: 'hidden',
    }`
    ).row.full-width
    //- header to click
    div(
      @click="compositionSelect()"
      ).row.fit.items-center.content-center.q-px-md.cursor-pointer.content-header
      span.text-white.text-bold {{ value.name }}
    composition-progress(
      v-if="stateExplorer.compositionSelected === value.id"
      :value="value"
      :stateExplorer="stateExplorer").fit
  //- selected
  div(
    v-if="stateExplorer.compositionSelected === value.id"
    :style=`{}`
    ).row.full-width.q-pa-xs
    q-btn(
      @click="compositionPlayPause()"
      round flat dense
      :color="stateExplorer.playing ? 'red' : 'grey-6'"
      :icon="stateExplorer.playing ? 'pause' : 'play_arrow'")
    q-btn(round flat dense color="grey-6" icon="edit" @click="compositionEdit()")
    .col
    q-btn(round flat dense color="grey-6" icon="refresh" @click="compositionRefresh()")
    q-btn(round flat dense color="green" icon="check" @click="compositionDone")
</template>

<script>
import compositionProgress from './composition_progress'

export default {
  name: 'compositionItem',
  components: {compositionProgress},
  props: ['stateExplorer', 'value'],
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    compositionPlayPause () {
      this.$log('compositionPlayPause')
      if (this.stateExplorer.playing) this.stateExplorer.player.pause()
      else this.stateExplorer.player.play()
    },
    compositionSelect () {
      this.$log('compositionSelect')
      this.stateExplorer.set('composition', this.value)
      this.stateExplorer.set('compositionSelected', this.value.id)
      let t = this.value.layers[0].figuresAbsolute[0].t
      this.stateExplorer.set('currentTime', t)
      this.stateExplorer.player.setCurrentTime(t)
      this.stateExplorer.player.play()
    },
    compositionEdit () {
      this.$log('compositionEdit')
      // this.stateExplorer.set('composition', this.value)
      this.stateExplorer.set('compositionEditing', this.value.id)
    },
    compositionRefresh () {
      this.$log('compositionRefresg')
      let t = this.value.layers[0].figuresAbsolute[0].t
      this.stateExplorer.set('currentTime', t)
      this.stateExplorer.player.setCurrentTime(t)
      this.stateExplorer.player.play()
    },
    compositionDone () {
      this.$log('compositionDone')
      this.stateExplorer.set('composition', null)
      this.stateExplorer.set('compositionSelected', null)
      this.stateExplorer.set('compositionEditing', null)
    }
  },
  mounted () {
  }
}
</script>
