<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{maxWidth: 700+'px', borderRadius: '10px 10px 0 0'}`
    ).row.full-width.items-center.content-center.justify-between.q-pt-sm.q-pb-xs
    router-link(:to="{name: 'feeds'}").col
      .row.full-height.items-center.content-center.justify-center
        q-btn(
          round flat dense icon="view_week"
          :color="$route.name.split('.')[0] === 'feeds' ? 'green' : 'grey-4'")
        .row.full-width.justify-center
          small.text-grey-6 Ленты
    router-link(:to="{name: 'trends'}").col
      .row.full-height.items-center.content-center.justify-center
        q-btn(
          round flat dense icon="explore"
          :color="$route.name.split('.')[0] === 'trends' ? 'green' : 'grey-4'")
        .row.full-width.justify-center
          small.text-grey-6 Новое
    router-link(:to="'/workspace/create'").col
      .row.full-height.items-center.content-center.justify-center
        q-btn(
          round dense color="green" icon="add" size="lg"
          :style=`{borderRadius: '50%'}`).q-mb-xs
        //- .row.full-width.justify-center
          small.text-grey-6 Создать
    router-link(:to="{name: 'notifications'}").col
      .row.full-height.items-center.content-center.justify-center
        q-btn(
          round flat dense icon="notifications"
          :color="$route.name.split('.')[0] === 'notifications' ? 'green' : 'grey-4'")
        .row.full-width.justify-center
          small.text-grey-6 Уведомления
    //- profile/menu
    .col
      div(
        @click="profileClick()"
        ).row.full-height.items-center.content-center.justify-center
        //- @click.native="profileClick"
        user-avatar(
          :url="$store.getters.currentUser().profile.photoUrl" :width="30" :height="30"
          :style=`{
            borderRadius: '50%',
            border: ($route.name.split('.')[0] === 'user' && $route.params.oid === $store.getters.currentUser().oid) ? '2px solid rgb(76,175,79)' : '2px solid rgba(0,0,0,0)'
          }`)
        .row.full-width.justify-center.q-mt-xs
          small.text-grey-6 Профиль
</template>

<script>
export default {
  name: 'kalpaMenuMobile',
  data () {
    return {
    }
  },
  methods: {
    profileClick () {
      this.$log('profileClick')
      // :to="'/user/'+$store.getters.currentUser().oid"
      if (this.$route.name.split('.')[0] === 'user' && this.$route.params.oid === this.$store.getters.currentUser().oid) {
        this.$store.commit('ui/stateSet', ['mobileMenuShow', !this.$store.state.ui.mobileMenuShow])
      }
      else {
        this.$router.push('/user/' + this.$store.getters.currentUser().oid)
      }
    }
  }
}
</script>
