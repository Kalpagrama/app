<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).column.full-width.b-50
  //- video wrapper
  div(
    v-if="options.usePlayer"
    ).col.full-width
    ws-content-video-player(:stateExplorer="stateExplorer")
  //- editor tools
  div(:style=`{position: 'relative'}`).col.full-width
    div(
      v-if="!options.onlyProgress"
      :style=`{paddingTop: '24px'}`).row.fit.justify-center
      editor(
        v-if="stateExplorer.player"
        @createNode="$emit('createNode')"
        @close="$emit('close')"
        @delete="$emit('delete')"
        :options="options"
        :stateExplorer="stateExplorer"
        :style=`{maxWidth: '600px'}`)
    div(
      v-if="options.onlyProgress"
      :style=`{
        position: 'relative',
        minHeight: '40px',
      }`
      ).row.full-width
      composition-progress(
        :value="composition" :active="false"
        :stateExplorer="stateExplorer"
        ).fit
        template(v-slot:actions)
          slot(name="actions")
</template>

<script>
import editor from './editor'
import compositionProgress from './composition_progress'

export default {
  name: 'videoEditor',
  props: {
    stateExplorerReady: {type: Object},
    composition: {type: Object},
    contentKalpa: {type: Object},
    options: {
      type: Object,
      default () {
        return {
          usePlayer: true,
          onlyProgress: false,
        }
      }
    }
  },
  components: {editor, compositionProgress},
  data () {
    return {
      // player
      player: null,
      currentTime: 0,
      duration: 0,
      loadeddata: false,
      playing: false,
    }
  },
  computed: {
    videoHeight () {
      return this.$q.screen.height * 0.4
    },
    stateExplorer () {
      if (this.stateExplorerReady) return this.stateExplorerReady
      else {
        return {
          // layout
          pageContentWidth: 680,
          // player
          player: this.player,
          duration: this.duration,
          currentTime: this.currentTime,
          loadeddata: this.loadeddata,
          playing: this.playing,
          // composition
          composition: this.composition,
          // content
          content: this.contentKalpa,
          contentWs: this.composition,
          set: (key, val) => {
            this[key] = val
          }
        }
      }
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
