<template lang="pug">
div(
  :style=`{
  }`
  ).row.full-width
  //- img(
  //-   v-if="preview"
  //-   draggable="false"
  //-   :style=`{
  //-     userSelect: 'none',
  //-     objectFit: 'contain'
  //-   }`
  //-   ).full-width
  player-video(
    v-if="composition"
    :ctx="ctx" :composition="composition"
    :visible="visible" :active="active" :mini="mini"
    )
    template(v-slot:editor=`{player, meta}`)
      slot(name="editor" :player="player" :meta="meta")
</template>

<script>
import playerVideo from './player_video'

export default {
  name: 'composition',
  components: {playerVideo},
  props: {
    ctx: {
      type: String,
      required: true,
      default () {
        return 'workspace'
      }
    },
    preview: {
      type: String
    },
    value: {
      type: Object,
      required: true
    },
    visible: {type: Boolean},
    active: {type: Boolean},
    mini: {type: Boolean}
  },
  data () {
    return {
      composition: null
    }
  },
  computed: {
  },
  watch: {
    value: {
      immediate: true,
      async handler (to, from) {
        this.$log('value CHANGED', to)
        if (to) {
          if (this.ctx === 'workspace') {
            this.composition = to
          }
          else {
            this.composition = await this.$store.dispatch('objects/get', {oid: to.oid})
          }
        }
      }
    },
  }
}
</script>
