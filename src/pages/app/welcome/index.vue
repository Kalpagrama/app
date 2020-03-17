<template lang="pug">
q-layout(
  view="hhh lpR fFf"
  :style=`{height: $q.screen.height+'px'}`)
  q-page-container.row.full-width.justify-center
    .row.full-width.justify-center.q-py-xl
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.justify-center
        span(:style=`{fontSize: '30px'}`).text-white.q-mr-sm Welcome to
        span(:style=`{fontSize: '30px'}`).text-green Kalpa
    //- wrapper
    div(
      :style=`{
        maxWidth: $store.state.ui.maxWidthPage+'px',
        borderRadius: '10px'
      }`
      ).row.full-width.bg-grey-10.q-pa-md
      like(v-show="page === 'like'" @types="types = $event")
      div(v-show="page === 'who'").row.full-width
        user-settings(:value="$store.getters.currentUser")
    //- actions
    .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.justify-start.q-py-md.q-px-sm
        q-btn(v-if="page === 'who'" outline color="green" no-caps @click="page = 'like'" icon="keyboard_arrow_left"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`)
          span Back to categories
        .col
        q-btn(v-if="page === 'who'" push color="green" no-caps @click="welcomeDone()"
          :loading="loading"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`)
          span Done
        q-btn(v-if="page === 'like'" push color="green" no-caps @click="page = 'who'"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`)
          span Next
</template>

<script>
import like from './like'
import userSettings from 'pages/app/user/user_settings'

export default {
  name: 'pageAppWelcome',
  components: {like, userSettings},
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
      await this.$store.dispatch('user/setFavouriteCategories', this.types)
      await this.$store.dispatch('objects/update', {
        oid: this.$store.getters.currentUser.oid,
        path: 'profile.tutorial',
        newValue: false
      })
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
