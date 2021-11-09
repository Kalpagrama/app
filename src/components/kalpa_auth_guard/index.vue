<template lang="pug">
page-auth(
  :message="message"
  :onSuccess="onSuccess"
  @close="$emit('close')"
)
</template>

<script>
import pageAuth from 'src/pages/auth/home/index.vue'

export default {
  name: 'kalpaAuthGuard',
  props: ['message'],
  components: {
    pageAuth,
  },
  computed: {
    authGuard () {
      return this.$store.state.ui.authGuard
    }
  },
  methods: {
    onSuccess () {
      this.$log('onSuccess')
      this.$emit('close')
      this.$eventBus.$emit('notice-check', 'initial_settings')
    }
  },
  mounted() {
    this.$log('mounted', this.message)
  }
}
</script>
