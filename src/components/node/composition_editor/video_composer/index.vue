<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit.bg-grey-10
  composition(
    v-if="composition"
    ctx="workspace"
    :value="composition"
    :content="content"
    :visible="true" :active="true" :mini="false"
    :styles=`{
      paddingLeft: styles.paddingLeft+'px',
      paddingRight: styles.paddingRight+'px',
      paddingBottom: styles.paddingBottom+'px',
      paddingTop: styles.paddingTop+'px',
    }`).fit
    template(v-slot:editor=`{content, player, meta}`)
      composer(
        ctx="workspace"
        :composition="composition"
        :player="player" :meta="meta"
        :styles="styles" @cancel="$emit('cancel')")
</template>

<script>
import composer from './composer'

export default {
  name: 'videoComposer',
  components: {composer},
  props: ['ctx', 'mode', 'composition', 'content'],
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
