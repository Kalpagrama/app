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
            span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white {{$t('pageSettings_title', 'Настройки')}}
  template(v-slot:body)
    div(:style=`{paddingTop: '70px', paddingBottom: '100px'}`).row.full-width.items-start.content-start.justify-center
      //- guest
      div(
        v-if="$store.getters.currentUser().profile.role === 'GUEST'"
        ).row.full-width.justify-center
        div(:style=`{maxWidth: 600+'px'}`).row.full-width.items-center.content-center.justify-center
          .row.full-width.justify-center
            q-icon(name="login" color="grey-8" size="100px")
          div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
            span.text-white {{$t('You can edit your profile')}}
          .row.full-width.justify-center.q-py-md
            q-btn(
              outline color="white" no-caps
              :to="'/auth/sign-in'"
              :style=`{
                height: '50px',
              }`)
              h1.text-white {{$t('Login')}}
          .row.full-width.justify-center.q-pt-md
            kalpa-docs(:style=`{maxWidth: '300px'}`)
      //- user
      router-view(
        v-if="$store.getters.currentUser().profile.role !== 'GUEST'")
</template>

<script>
import { AuthApi } from 'src/api/auth'
import kalpaDocs from 'components/kalpa_docs/index.vue'

export default {
  name: 'pageApp_settings',
  components: {
    kalpaDocs
  },
  data () {
    return {
    }
  },
  computed: {
    views () {
      return [
        {id: 'settings.account', name: this.$t('pageSettings_account_title', 'Профиль')},
        // {id: 'settings.workspace', name: this.$t('pageSettings_workspace_title', 'Мастерская')},
        // {id: 'settings.docs', name: this.$t('pageSettings_docs_title', 'Документы')}
      ]
    }
  },
  methods: {
  },
  async mounted () {
    this.$log('mounted')
    this.$log('currentUser', this.$store.getters.currentUser())
  }
}
</script>
