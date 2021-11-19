<template lang="pug">
kalpa-layout()
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
  template(v-slot:header)
    .row.full-width.justify-center.b-30.q-pt-sm.q-px-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(:style=`{height: '60px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pa-sm.b-40
          q-icon(name="settings" color="white" size="30px").q-mx-sm
          .col
            span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white {{$t('Настройки')}}
  template(v-slot:body)
    .row.full-width.items-start.content-start.justify-center
      view-guest(
        v-if="$store.getters.isGuest")
      router-view(
        v-else)
</template>

<script>
import viewGuest from './view_guest/index.vue'

export default {
  name: 'pageApp_settings',
  components: {
    viewGuest
  },
  data () {
    return {
    }
  },
  computed: {
    views () {
      return [
        {id: 'settings.account', name: this.$t('Профиль')},
      ]
    }
  },
  methods: {
  },
  async mounted () {
    this.$log('mounted')
  }
}
</script>
