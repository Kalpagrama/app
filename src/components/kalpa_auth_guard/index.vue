<template lang="pug">
.row.full-width.justify-center
  div(v-if="!authScreenShow && message"
      :style=`{
        // height: '200px',
        width: $q.screen.xs ? '100%' : '500px',
        borderRadius: '20px 20px 0 0'
      }`).row.justify-center.q-pa-md.b-45
    span.text-grey-4.text-bold.text-center.q-pb-md {{message}}
    .row.full-width.justify-center.content-center.items-center
      q-btn(outline color="grey-6" icon="login" :label="$t('Войти')" @click="authScreenShow=true")
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    page-auth(v-if="authScreenShow || !message"
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
  data() {
    return {
      guardScreenShow: true,
      authScreenShow: false
    }
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
      this.$eventBus.$emit('notice-check', {notice: 'initial_settings', force: false})
    }
  },
  mounted() {
    this.$log('mounted', this.message)
  }
}
</script>
