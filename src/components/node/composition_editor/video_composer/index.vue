<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  composition(
    v-if="composition"
    :ctx="ctx" :mode="mode" :value="composition"
    :visible="true" :active="true" :mini="false"
    :styles=`{
      paddingLeft: styles.paddingLeft+'px',
      paddingRight: styles.paddingRight+'px',
      paddingBottom: styles.paddingBottom+'px',
      paddingTop: styles.paddingTop+'px',
    }`).fit
    template(v-slot:editor=`{player, meta}`)
      composer(:ctx="ctx" :mode="mode" :composition="composition" :player="player" :meta="meta" :styles="styles" @cancel="$emit('cancel')")
</template>

<script>
import composer from './composer'

export default {
  name: 'videoComposer_index',
  components: {composer},
  props: ['ctx', 'mode', 'composition'],
  data () {
    return {
      styles: {
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 140,
        paddingTop: 0
      }
    }
  }
}
</script>
