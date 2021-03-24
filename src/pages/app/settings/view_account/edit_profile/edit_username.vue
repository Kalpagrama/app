<template lang="pug">
.row.full-width.q-pa-xs
  .row.full-width.q-pa-sm
    span(
      :style=`{
        fontSize: '20px',
      }`
    ).text-white.text-bold.q-ml-xs @{{ username}}
  .row.full-width.q-px-sm
    q-btn(
      @click="editing = true"
      flat dense color="grey-6" no-caps size="sm") {{('Change username')}}
  //- .row.full-width.q-px-sm.q-py-xs
    small.text-white Username
  //- q-input(
    v-model="username"
    dark
    borderless flat
    placeholder="Username"
    :debounce="600"
    :input-style=`{
      background: 'rgb(40,40,40)',
      borderRadius: '10px',
      paddingLeft: '12px',
    }`
    ).full-width
</template>

<script>
import { ObjectApi } from 'src/api/object'
import { UserApi } from 'src/api/user'

export default {
  name: 'editUsername',
  props: ['currentUser'],
  data () {
    return {
      username: '',
      usernameTaken: false,
      usernameLock: false,
    }
  },
  watch: {
    currentUser: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('currentUser TO', to)
        if (to.username) {
          this.usernameLock = true
          this.username = to.username
          this.usernameLock = false
        }
      }
    },
    username: {
      async handler (to, from) {
        this.$log('username TO', to)
        if (this.usernameLock) return
        if (to && to.length >= 3) {
          let usernameAvaible = await UserApi.checkUsernameFree(to)
          this.$log('usernameAvaible', usernameAvaible)
          if (usernameAvaible === true) {
            // update username
            await ObjectApi.update(this.currentUser.oid, 'username', to)
          }
          // username is taken ?
          if (usernameAvaible === false) {
            this.usernameTaken = true
          }
        }
      }
    }
  }
}
</script>
