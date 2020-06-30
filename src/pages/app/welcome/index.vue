<template lang="pug">
div(
  :style=`{
    height: $q.screen.height+'px',
  }`
  ).column.full-width
  //- header
  .row.full-width.justify-center.q-pt-sm
    div(
      :style=`{
        height: '100px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
        borderRadius: '10px', overflow: 'hidden',
      }`).row.full-width.items-center.content-center.q-px-md.b-50
      span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('Welcome to Kalpagramma')}}
  //- body: wrapper
  .col.full-width.q-py-md
    .row.fit.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.maxWidthPage+'px',
          borderRadius: $store.state.ui.borderRadius+'px'
        }`
        ).row.fit.b-50
        edit-categories(v-if="pageId === 'categories'" @next="pageId = 'profile'")
        edit-profile(v-if="pageId === 'profile'" @prev="pageId = 'categories'" @next="welcomeDone()")
        //- edit-welcome(@prev="pageId = 'profile'" @next="welcomeDone()")
</template>

<script>
import { ObjectsApi } from 'src/api/objects'

import editCategories from './edit_categories'
import editProfile from './edit_profile'
import editWelcome from './edit_welcome'

export default {
  name: 'pageAppWelcome',
  components: {editCategories, editProfile, editWelcome},
  data () {
    return {
      pageId: 'categories',
    }
  },
  methods: {
    async welcomeDone () {
      this.$log('welcomeDone')
      this.$q.loading.show({spinnerColor: 'green', message: 'Aligning sattelites...'})
      let currentUser = this.$store.getters.currentUser()
      await ObjectsApi.update(currentUser.oid, 'profile.tutorial', false, currentUser.rev)
      currentUser.profile.tutorial = false // currentUser реактивен
      // done
      await this.$wait(1000)
      this.$q.loading.hide()
      this.$q.notify({type: 'positive', message: 'Welcome !'})
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
