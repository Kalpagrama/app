<template lang="pug">
div(
  :style=`{
    paddingTop: '16px',
    paddingBottom: '16px',
  }`
  ).row.full-width.justify-center
  //- body
  div(
    v-if="currentUser"
    :style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width.items-start.content-start
    .row.full-width.items-start.content-start
      //- avatar
      .col-xs-12.col-sm-4.q-px-sm.q-pt-md
        edit-avatar(:currentUser="currentUser")
      //- right side
      .col-xs-12.col-sm-8.q-px-sm
        edit-profile(:currentUser="currentUser")
        actions(:currentUser="currentUser")
        .row.full-width.q-px-sm
          .row.full-width.q-px-sm.q-py-xs
            small.text-grey-8 Правовые документы:
          kalpa-docs
          .row.full-width.q-pl-sm.q-py-xs
            small(
              :style=`{userSelect: 'none', marginLeft: '0px'}`
              ).text-grey-9 {{$t('kalpaMenu_version', 'Версия') + ': ' + $store.state.core.version + ' - ' + $store.state.core.buildDate}}
</template>

<script>
export default {
  name: 'pageApp_settigns_viewAccount',
  components: {
    editAvatar: () => import('./edit_avatar/index.vue'),
    editProfile: () => import('./edit_profile/index.vue'),
    actions: () => import('./actions/index.vue'),
  },
  data () {
    return {
      currentUser: null,
    }
  },
  async mounted () {
    this.$log('mounted')
    this.currentUser = this.$store.getters.currentUser()
  }
}
</script>
