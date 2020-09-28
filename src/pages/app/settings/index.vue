<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pt-sm.q-px-sm
        div(:style=`{height: '60px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pl-md.q-pr-xs.b-40
          q-icon(name="tune" color="white" size="30px").q-mr-sm
          .col
            span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white {{$t('pageSettings_title', 'Настройки')}}
        .row.full-width.q-px-md
          q-tabs(
            :value="$route.name" @input="$router.push({name: $event})"
            no-caps dense active-color="white" align="left" switch-indicator).text-grey-8
            q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
  q-page-container
    router-view
</template>

<script>
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
        {id: 'settings.feeds', name: this.$t('pageSettings_feeds_title', 'Ленты')},
        {id: 'settings.workspace', name: this.$t('pageSettings_workspace_title', 'Мастерская')}
      ]
    }
  },
  mounted () {
    this.$log('mounted')
    this.$log('currentUser', this.$store.getters.currentUser())
  }
}
</script>
