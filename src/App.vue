<template lang="pug">
div(id="q-app")
  router-view(v-if="$store.getters.nodeCategories.length > 0")
  //- router-view
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { scroll } from 'quasar'
const { getScrollTarget, getScrollPosition, setScrollPosition, getScrollHeight } = scroll

export default {
  name: 'App',
  methods: {
    handleFocusin (e) {
      const job = () => {
        // this.$log('handleFocusin', e)
        if (e.target.type === 'text' || e.target.type === 'textarea' || e.target.type === 'email' || e.target.type === 'password') {
          this.$store.commit('ui/stateSet', ['userTyping', true])
          if (this.$q.platform.is.mobile) {
            const top = e.target.getBoundingClientRect().top
            if (top < this.$q.screen.height / 4) return
            // this.$q.notify({position: 'right', message: 'Scroll into view: ' + top})
            const scrollTarget = getScrollTarget(e.target)
            // e.target.scrollIntoView()
            // let i = setInterval(() => {
            //   e.target.scrollIntoView()
            //   const scrollPosition = getScrollPosition(scrollTarget)
            //   setScrollPosition(scrollTarget, scrollPosition - 90)
            // }, 0)
            // this.$wait(600).then(() => {
            //   clearInterval(i)
            // })
          }
        }
      }
      setTimeout(() => {
        job()
      }, 0)
    },
    handleFocusout (e) {
      // this.$log('handleFocusout', e)
      if (e.target.type === 'text' || e.target.type === 'textarea' || e.target.type === 'email' || e.target.type === 'password') {
        this.$store.commit('ui/stateSet', ['userTyping', false])
      }
    },
    onResize (e) {
      // this.$log('onResize', e)
      // this.$store.commit('ui/stateSet', ['viewportHeight', e.height])
      // this.$store.commit('ui/stateSet', ['viewportWidth', e.width])
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
      this.$store.commit('ui/stateSet', ['viewportHeight', viewport.height])
      this.$store.commit('ui/stateSet', ['viewportWidth', viewport.width])
      this.$store.commit('ui/stateSet', ['viewportOffsetTop', viewport.offsetTop])
    }
  },
  created () {
  },
  async mounted () {
    // this.$log('mounted')
    window.addEventListener('focusin', this.handleFocusin)
    window.addEventListener('focusout', this.handleFocusout)
    window.visualViewport.addEventListener('resize', this.visualViewportOnResize)
    this.$store.commit('ui/stateSet', ['viewportHeight', window.visualViewport.height])
    this.$store.commit('ui/stateSet', ['viewportWidth', window.visualViewport.width])
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
    window.removeEventListener('focusin', this.handleFocusin)
    window.removeEventListener('focusout', this.handleFocusout)
    window.visualViewport.removeEventListener('resize', this.visualViewportOnResize)
  }
}
</script>
