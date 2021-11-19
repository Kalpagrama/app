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
        .row.full-width.q-pa-sm
          kalpa-docs()
          .row.full-width.q-py-lg
            small(
              :style=`{userSelect: 'none'}`
              ).text-grey-9 {{$t('Версия') + ': ' + $store.state.core.version + ' - ' + $store.state.core.buildDate}}
</template>

<script>
import editAvatar from 'src/pages/app/settings/view_account/edit_avatar/index.vue'
import editProfile from 'src/pages/app/settings/view_account/edit_profile/index.vue'
import actions from 'src/pages/app/settings/view_account/actions/index.vue'

export default {
  name: 'pageApp_settigns_viewAccount',
  components: {
    editAvatar,
    // editAvatar,
    editProfile,
    actions,
  },
  data () {
    return {
      currentUser: null,
    }
  },
  async mounted () {
    this.$log('mounted')
    this.currentUser = this.$store.getters.currentUser
  }
}
</script>
