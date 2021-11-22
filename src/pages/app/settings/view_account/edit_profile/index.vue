<template lang="pug">
.row.full-width.q-pt-sm
  //- edit-username(:currentUser="currentUser")
  edit-name(:currentUser="currentUser").q-mb-sm
  edit-status(:currentUser="currentUser")
  edit-email(:currentUser="currentUser")
  edit-password(:currentUser="currentUser")
  edit-lang(:currentUser="currentUser")
</template>

<script>
import editUsername from './edit_username.vue'
import editPassword from './edit_password.vue'
import editName from './edit_name.vue'
import editStatus from './edit_status.vue'
import editEmail from './edit_email.vue'
import editLang from './edit_lang.vue'

export default {
  name: 'editProfile',
  props: ['currentUser'],
  components: {
    editUsername,
    editName,
    editStatus,
    editEmail,
    editPassword,
    editLang
  },
  data () {
    return {}
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
