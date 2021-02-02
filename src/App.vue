<template lang="pug">
div(id="q-app")
  router-view
</template>

<script>
export default {
  name: 'App',
  methods: {
    handleFocusin (e) {
      // this.$log('handleFocusin', e)
      if (e.target.type === 'text' || e.target.type === 'textarea') {
        this.$store.commit('ui/stateSet', ['userTyping', true])
      }
    },
    handleFocusout (e) {
      // this.$log('handleFocusout', e)
      if (e.target.type === 'text' || e.target.type === 'textarea') {
        this.$store.commit('ui/stateSet', ['userTyping', false])
      }
    },
    onResize (e) {
      // this.$log('onResize', e)
      this.$store.commit('ui/stateSet', ['viewportHeight', e.height])
      this.$store.commit('ui/stateSet', ['viewportWidth', e.width])
      if (this.width > this.height) {
        this.$store.commit('ui/stateSet', ['pageVertical', false])
      }
      if (this.width < this.height) {
        this.$store.commit('ui/stateSet', ['pageVertical', true])
      }
    },
    visualViewportOnResize (e) {
      // this.$log('visualViewportOnResize', e)
      const viewport = window.visualViewport
      this.$log('viewport', viewport)
      this.$store.commit('ui/stateSet', ['viewportOffsetTop', viewport.offsetTop])
    }
  },
  mounted () {
    // this.$log('mounted')
    window.addEventListener('focusin', this.handleFocusin)
    window.addEventListener('focusout', this.handleFocusout)
    window.visualViewport.addEventListener('resize', this.visualViewportOnResize)
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
    window.removeEventListener('focusin', this.handleFocusin)
    window.removeEventListener('focusout', this.handleFocusout)
    window.visualViewport.removeEventListener('resize', this.visualViewportOnResize)
  }
}
</script>
