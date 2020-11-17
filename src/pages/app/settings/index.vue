<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30.q-pt-sm.q-px-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(:style=`{height: '60px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pa-sm.b-40
          q-icon(name="tune" color="white" size="30px").q-mx-sm
          .col
            span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white {{$t('pageSettings_title', 'Настройки')}}
          q-btn(round flat color="red" icon="power_off" @click="logout()")
        .row.full-width.q-px-md
          q-tabs(
            :value="$route.name" @input="$router.push({name: $event})"
            no-caps dense active-color="green" align="left" switch-indicator).text-grey-8
            q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
  q-page-container
    router-view
</template>

<script>
import { AuthApi } from 'src/api/auth'
import {systemReset, shareWith} from 'src/system/services'

export default {
  name: 'pageApp_settings',
  data () {
    return {
    }
  },
  computed: {
    views () {
      return [
        {id: 'settings.account', name: this.$t('pageSettings_account_title', 'Профиль')},
        {id: 'settings.workspace', name: this.$t('pageSettings_workspace_title', 'Мастерская')},
        {id: 'settings.docs', name: this.$t('pageSettings_docs_title', 'Документы')}
      ]
    }
  },
  methods: {
    async logout () {
      this.$log('logout')
      if (!confirm('Really logout ?')) return
      this.logoutLoading = true
      await this.$wait(300)
      await AuthApi.logout()
      this.$log('AuthApi.logout() complete')
      await this.$router.replace('/auth')
      this.$log('this.$router.replace auth complete')
      this.logoutLoading = false
    },
  },
  mounted () {
    this.$log('mounted')
    this.$log('currentUser', this.$store.getters.currentUser())
  }
}
</script>
