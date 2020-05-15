<template lang="pug">
composition(
  v-if="composition"
  :ctx="ctx"
  :value="composition"
  :visible="options.visible" :active="options.active" :mini="options.mini"
  :styles=`{
    paddingLeft: styles.paddingLeft+'px',
    paddingRight: styles.paddingRight+'px',
    paddingBottom: styles.paddingBottom+'px',
    paddingTop: styles.paddingTop+'px',
  }`).b-100
  template(v-slot:editor=`{player, meta}`)
    composer(
      :ctx="ctx"
      :composition="composition"
      :player="player" :meta="meta" @meta="$parent.emit('meta', $event)"
      :styles="styles" @cancel="$emit('cancel')")
</template>

<script>
import composer from './composer'

export default {
  name: 'videoComposer',
  components: {composer},
  props: {
    ctx: {type: String},
    composition: {type: Object},
    options: {
      type: Object,
      default () {
        return {
          visible: true,
          active: true,
          mini: false
        }
      }
    }
  },
  data () {
    return {
      styles: {
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingTop: 0
      }
    }
  }
}
</script>
