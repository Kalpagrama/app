<style lang="sass">
.blinking
  animation: blinker 1s linear infinite
@keyframes blinker
  50%
    opacity: 0
</style>

<template lang="pug">
div(
  @click="onClick"
  :style=`{position: 'relative', minHeight: '60px'}`).row.full-width.justify-center.q-px-md
  //- blinking green carette
  //- div(
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
  //- v-if="isActive"
  q-input(
    v-model="node.name"
    ref="nameInput"
    borderless dark color="white"
    type="textarea" autogrow
    placeholder="В чем суть?"
    :maxlength="120"
    :resize="false"
    :input-style=`{
      fontSize: fontSize+'px',
      //- fontWeight: 'bold',
      lineHeight: 1.1,
      //- textAlign: 'center',
      paddingTop: '22px',
    }`
    :style=`{
      //- position: 'fixed', top: '0px',
    }`
    @focus="isFocused = true, $emit('focused')"
    @blur="isFocused = false, $emit('blurred')"
    ).full-width
</template>

<script>
export default {
  name: 'nameEditor',
  props: ['node', 'isActive'],
  data () {
    return {
      isFocused: false,
      // isShow: false
    }
  },
  computed: {
    fontSize () {
      let l = this.node.name.length
      if (l < 20) return 20
      else if (l < 30) return 16
      else if (l < 40) return 14
      else return 12
    }
  },
  watch: {
    isActive: {
      async handler (to, from) {
        if (to) {
          // await this.$wait(300)
          // this.isShow = true
          this.$refs.nameInput.focus()
        }
      }
    }
  },
  methods: {
    onClick () {
      this.$refs.nameInput.focus()
    }
  }
}
</script>
