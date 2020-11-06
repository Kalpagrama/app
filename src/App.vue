<template lang="pug">
div(id="q-app")
  router-view
</template>

<script>
export default {
  name: 'App',
  methods: {
    handleFocusin (e) {
      if (e.target.type === 'text' || e.target.type === 'textarea') {
        // this.$log('handleFocusin', e)
        this.$store.commit('ui/stateSet', ['userTyping', true])
      }
    },
    handleFocusout (e) {
      if (e.target.type === 'text' || e.target.type === 'textarea') {
        // this.$log('handleFocusout', e)
        this.$store.commit('ui/stateSet', ['userTyping', false])
      }
    },
  },
  mounted () {
    window.addEventListener('focusin', this.handleFocusin)
    window.addEventListener('focusout', this.handleFocusout)
  },
  beforeDestroy () {
    window.removeEventListener('focusin', this.handleFocusin)
    window.removeEventListener('focusout', this.handleFocusout)
  }
}
</script>
