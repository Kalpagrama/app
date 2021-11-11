<template lang="pug">
.row.full-width
  .row.full-width
    edit-avatar(:currentUser="currentUser")
  .row.full-width
    edit-profile(:currentUser="currentUser")
</template>

<script>
import editAvatar from 'src/pages/app/settings/view_account/edit_avatar/index.vue'
import editProfile from 'src/pages/app/settings/view_account/edit_profile/index.vue'

export default {
  name: 'profileEditor',
  components: {
    editAvatar,
    editProfile
  },
  data () {
    return {
      currentUser: null,
    }
  },
  async mounted () {
    this.currentUser = this.$store.getters.currentUser
  }
}
</script>
