<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).row.full-width.justify-center
  q-input(
    :value="value" @input="$emit('input', $event)"
    borderless autofocus dark
    type="textarea" autogrow
    placeholder="В чем суть?"
    spellcheck="false"
    :style=`{
      maxWidth: '600px',
    }`
    :input-style=`{
      fontSize: fontSize,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: '1.1',
      caretColor: 'rgb(76,175,80)',
      //- color: 'white'
    }`
    @focus="onFocus"
    @blur="onBlur"
    ).full-width.justify-center
</template>

<script>
export default {
  name: 'pageApp_nodeEditor_editName',
  props: ['value'],
  data () {
    return {
      isFocused: false
    }
  },
  computed: {
    fontSize () {
      // TODO: progressive fornSize...
      if (this.value.length < 50) return '30px'
      else return '20px'
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
