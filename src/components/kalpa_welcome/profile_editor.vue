<template lang="pug">
.row.full-width
  .row.full-width
    edit-avatar(:currentUser="currentUser")
  .row.full-width
    edit-profile(:currentUser="currentUser")
</template>

<script>
export default {
  name: 'profileEditor',
  components: {
    editAvatar: () => import('pages/settings/view_account/edit_avatar/index.vue'),
    editProfile: () => import('pages/settings/view_account/edit_profile/index.vue'),
  },
  data () {
    return {
      currentUser: null,
    }
  },
  async mounted () {
    this.currentUser = this.$store.getters.currentUser()
  }
}
</script>
