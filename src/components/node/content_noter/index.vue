<template lang="pug">
.column.fit
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
      editor(:ctx="ctx" :mode="mode" :composition="composition" :player="player" :meta="meta" :styles="styles" @cancel="$emit('cancel')")
</template>

<script>
export default {
  name: 'contentNoter',
  props: ['value'],
  data () {
    return {
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
