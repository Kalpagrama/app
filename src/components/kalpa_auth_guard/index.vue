<template lang="pug">
page-auth(
  :onSuccess="onSuccess"
  @close="$emit('close')"
)
</template>

<script>
import pageAuth from 'pages/auth/home/index.vue'

export default {
  name: 'kalpaAuthGuard',
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
    }
  }
}
</script>
