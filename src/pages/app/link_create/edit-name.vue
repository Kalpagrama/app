<style>
.blink {
  animation: blink-animation 1.2s steps(5, start) infinite;
  -webkit-animation: blink-animation 1.2s steps(5, start) infinite;
}
@keyframes blink-animation {
  to {
    visibility: hidden;
  }
}
@-webkit-keyframes blink-animation {
  to {
    visibility: hidden;
  }
}
</style>

<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).row.full-width.justify-center
  q-input(
    :value="value" @input="$emit('input', $event)"
    borderless autofocus
    type="textarea" autogrow
    spellcheck="false"
    :style=`{
      maxWidth: '600px',
    }`
    :input-style=`{
      fontSize: fontSize,
      fontWeight: 'bold',
      textAlign: 'center',
      caretColor: 'rgb(76,175,80)',
      color: 'white'
    }`
    @focus="onFocus"
    @blur="onBlur"
    ).full-width.justify-center
  //- blinker
  div(
    v-if="showBlink"
    :style=`{
      position: 'absolute', zIndex: 200,
      pointerEvents: 'none',
    }`
    ).row.fit.items-center.content-center.justify-center
    div(
      :style=`{
        height: '70%',
        width: '1px',
      }`
      ).row.bg-green.blink
</template>

<script>
export default {
  name: 'pageApp_link_editName',
  props: ['value'],
  data () {
    return {
      isFocused: false
    }
  },
  computed: {
    showBlink () {
      return this.value.length === 0 && !this.isFocused
    },
    fontSize () {
      // TODO: progressive fornSize...
      if (this.value.length < 50) return '30px'
      else return '14px'
    }
  },
  methods: {
    onFocus () {
      this.$log('onFocus')
      this.isFocused = true
    },
    onBlur () {
      this.$log('onBlur')
      this.isFocused = false
    }
  }
}
</script>
