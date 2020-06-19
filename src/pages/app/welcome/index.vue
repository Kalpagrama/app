<template lang="pug">
q-layout(
  view="hhh lpR fFf"
  :style=`{height: $q.screen.height+'px'}`)
  q-page-container.row.full-width.justify-center
    .row.full-width.justify-center.q-py-md.br
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.justify-center
        span(:style=`{fontSize: '30px'}`).text-white.q-mr-sm Welcome to
        span(:style=`{fontSize: '30px'}`).text-green Kalpagramma
    //- wrapper
    div(
      :style=`{
        maxWidth: $store.state.ui.maxWidthPage+'px',
        borderRadius: $store.state.ui.borderRadius+'px'
      }`
      ).row.full-width.bg-grey-10.q-pa-md.br
      like(v-show="page === 'like'" @types="types = $event")
      div(v-show="page === 'who'").row.full-width.br
        //- user-settings(:value="$store.getters.currentUser")
    //- actions
    .row.full-width.justify-center.br
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.justify-start.q-py-md.q-px-sm
        q-btn(v-if="page === 'who'" outline color="green" no-caps @click="page = 'like'" icon="keyboard_arrow_left"
          :style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`)
          span Back to categories
        .col
        q-btn(v-if="page === 'who'" push color="green" no-caps @click="welcomeDone()"
          :loading="loading"
          :style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`)
          span Done
        q-btn(v-if="page === 'like'" push color="green" no-caps @click="page = 'who'"
          :style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`)
          span Next
</template>

<script>
import like from './like'
import { UserApi } from 'src/api/user'
// import userSettings from 'pages/app/user/user_settings'

export default {
  name: 'pageAppWelcome',
  components: {like},
  data () {
    return {
      page: 'like',
      types: [],
      loading: false
    }
  },
  methods: {
    async welcomeDone () {
      this.$log('welcomeDone')
      this.loading = true
      await UserApi.setFavouriteCategories(this.types)
      // todo
      // await this.$store.dispatch('objects/update', {
      //   oid: this.$store.getters.currentUser.oid,
      //   path: 'profile.tutorial',
      //   newValue: false
      // })
      await this.$wait(1000)
      // TODO some account shit
      this.loading = false
      this.$router.push('/')
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
