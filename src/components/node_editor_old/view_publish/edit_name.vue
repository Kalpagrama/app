<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).row.full-width.justify-center
  q-input(
    v-model="node.name"
    borderless dark
    type="textarea" autogrow
    spellcheck="false"
    :placeholder="placeholder"
    :autofocus="isAutofocus"
    :style=`{
      maxWidth: '600px',
    }`
    :input-style=`{
      fontSize: fontSize,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: '1.1',
      caretColor: 'rgb(76,175,80)',
      paddingTop: '10px',
    }`
    @focus="onFocus"
    @blur="onBlur"
    ).full-width.justify-center
</template>

<script>
export default {
  name: 'pageApp_nodeEditor_editName',
  // props: ['node'],
  props: {
    node: {type: Object},
    placeholder: {type: String, default: 'В чем суть?'}
  },
  data () {
    return {
      isFocused: false
    }
  },
  computed: {
    fontSize () {
      // TODO: progressive fornSize...
      if (this.node.name.length < 50) return '30px'
      else return '20px'
    },
    isAutofocus () {
      return this.$q.screen.gt.sm
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
