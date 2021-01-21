<template lang="pug">
q-page(
  :style=`{
    paddingTop: '16px',
    paddingBottom: '100px',
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
        .row.full-width.q-px-sm.q-py-xs
          small.text-grey-8 Правовые документы:
        kalpa-docs
</template>

<script>
import kalpaDocs from 'components/kalpa_docs/index.vue'

export default {
  name: 'pageApp_settigns_viewAccount',
  components: {
    kalpaDocs,
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
