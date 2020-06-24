<style lang="sass">
.composition-item
  cursor: pointer
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(
  @click="$emit('edit')"
  :style=`{
    minHeight: '50px', borderRadius: $store.state.ui.borderRadius+'px',
  }`
  ).row.full-width.items-center.content-center.composition-item.b-70
  //- span.text-white.text-bold {{ compositionName }}
  //- .row.full-width
  //-   small.text-grey-5 {{ compositionStart }}
  ws-composition-editor(
    :value="composition"
    :sidPlayer="sidPlayer"
    :options=`{
      mode: 'progress',
    }`
    ).b-60
</template>

<script>
export default {
  name: 'compositionItem',
  props: ['composition', 'compositionIndex'],
  inject: ['sidExplorer', 'sidPlayer'],
  data () {
    return {
    }
  },
  computed: {
    compositionName () {
      return this.composition.name
    },
    compositionStart () {
      return this.$time(this.composition.layers[0].figuresAbsolute[0].t)
    }
  }
}
</script>
