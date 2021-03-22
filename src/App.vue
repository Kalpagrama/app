<template lang="pug">
div(id="q-app")
  router-view
</template>

<script>
import { scroll } from 'quasar'
const { getScrollTarget, getScrollPosition, setScrollPosition, getScrollHeight } = scroll

export default {
  name: 'App',
  methods: {
    handleFocusin (e) {
      this.$log('handleFocusin', e)
      if (e.target.type === 'text' || e.target.type === 'textarea' || e.target.type === 'email' || e.target.type === 'password') {
        this.$store.commit('ui/stateSet', ['userTyping', true])
        if (this.$q.platform.is.mobile) {
          const top = e.target.getBoundingClientRect().top
          if (top < this.$q.screen.height / 3) return
          this.$q.notify({position: 'right', message: 'Scroll into view'})
          e.target.scrollIntoView()
          // e.target.scrollIntoView({behavior: 'smooth'})
          const scrollTarget = getScrollTarget(e.target)
          const scrollPosition = getScrollPosition(scrollTarget)
          setScrollPosition(scrollTarget, scrollPosition - 90)
        }
      }
    },
    handleFocusout (e) {
      this.$log('handleFocusout', e)
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
      // this.$log('viewport', viewport)
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
