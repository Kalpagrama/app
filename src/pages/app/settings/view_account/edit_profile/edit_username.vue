<template lang="pug">
.row.full-width.q-pa-xs
  .row.full-width.q-px-sm.q-py-xs
    small.text-white Username
  q-input(
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
  data () {
    return {
      username: ''
    }
  },
  watch: {
    username: {
      async handler (to, from) {
        this.$log('username TO', to)
        // await ObjectApi.update(oidUser, 'username', 'new username')
        if (to && to.length >= 3) {
          let usernameAvaible = await UserApi.checkUsernameFree('name to check')
          this.$log('usernameAvaible', usernameAvaible)
        }
      }
    }
  }
}
</script>
