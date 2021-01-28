<style lang="sass">
.blinking
  animation: blinker 1s linear infinite
@keyframes blinker
  50%
    opacity: 0
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.justify-center.q-px-md
  //- blinking green carette
  div(
    v-if="!isFocused && node.name.length === 0"
    :style=`{
      position: 'absolute', zIndex: 1000,
      left: '50%', top: '20%',
      width: '1px',
      height: '80%',
      pointerEvents: 'none',
    }`
    ).row.bg-green.blinking
  //- input with dynamic fontSize...
  q-input(
    v-model="node.name"
    borderless dark color="white"
    type="textarea" autogrow
    placeholder="В чем суть?"
    :maxlength="120"
    :resize="false"
    :input-style=`{
      fontSize: fontSize+'px',
      //- fontWeight: 'bold',
      lineHeight: 1.1,
      textAlign: 'center',
    }`
    :style=`{}`
    @focus="isFocused = true"
    @blur="isFocused = false"
    ).full-width
</template>

<script>
export default {
  name: 'nameEditor',
  props: ['node'],
  data () {
    return {
      isFocused: false,
    }
  },
  computed: {
    fontSize () {
      let l = this.node.name.length
      if (l < 20) return 30
      else if (l < 30) return 20
      else if (l < 40) return 16
      else return 14
    }
  }
}
</script>
