<template lang="pug">
.row.full-width.justify-center
  //- menu for guests
  div(
    v-if="isGuest"
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      borderRadius: '10px 10px 0 0',
    }`
    ).row.full-width.justify-between.b-40.q-px-xs.q-pb-xs.q-pt-sm
    q-btn(
      flat icon="search" no-caps
      :to="'/trends'"
      :color="'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small(:style=`{whiteSpace: 'nowrap'}`) Поиск
    q-btn(
      :to="'/auth'"
      flat color="white" no-caps
      :style=`{
        height: '44px',
      }`).q-px-md.q-mt-xs.b-50
      span.text-white Войти
    q-btn(
      @click="$store.commit('ui/stateSet', ['mobileMenuShow', true])"
      flat icon="menu" no-caps
      :color="$store.state.ui.mobileMenuShow ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Меню
  //- menu for users
  div(
    v-if="!isGuest"
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      borderRadius: '10px 10px 0 0',
    }`
    ).row.full-width.justify-between.b-40.q-px-sm.q-pt-sm
    q-btn(
      flat no-caps
      :to="'/feeds/all'"
      :color="$route.name.split('.')[0] === 'feeds' ? 'green' : 'grey-7'"
      :style=`{
        width: '60px',
      }`
      ).row.items-center.content-center.justify-center
      kalpa-logo(:width="23" :height="23" :style=`{pointEvents: 'none'}`)
      .row.full-width.justify-center
        small(:style=`{whiteSpace: 'nowrap'}`).text-grey-7 Лента
    q-btn(
      flat icon="search" no-caps
      :to="'/trends'"
      :color="$route.name.split('.')[0] === 'trends' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small(:style=`{whiteSpace: 'nowrap'}`) Поиск
    q-btn(
      round no-caps
      :to="'/workspace'"
      :color="'green'"
      :style=`{width: '50px', height: '50px', borderRadius: '50%',}`)
      anvil(size="30px")
    //- q-btn(
      flat no-caps icon="bookmark_outline"
      :to="'/workspace/'"
      :color="$route.name.split('.')[0] === 'workspace' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Закладки
    q-btn(
      flat no-caps icon="notifications_none"
      :to="'/notifications/'"
      :color="$route.name.split('.')[0] === 'notifications' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      q-badge(color="red" floating transparent) •
      .row.full-width.justify-center
        small Активность
    //- currentUserPage
    q-btn(
      flat no-caps
      :to="'/user/'+$store.getters.currentUser().oid"
      :color="$store.state.ui.mobileMenuShow ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      user-avatar(
        :url="$store.getters.currentUser().profile.photoUrl" :width="24" :height="24"
        :style=`{
          borderRadius: '50%',
          border: ($route.name.split('.')[0] === 'user' && $route.params.oid === $store.getters.currentUser().oid) ? '2px solid rgb(76,175,79)' : '2px solid rgba(0,0,0,0)'
        }`)
      .row.full-width.justify-center
        small Профиль
</template>

<script>
export default {
  name: 'kalpaMenuMobile',
  components: {
    anvil: () => import('components/kalpa_icons/anvil.vue')
  },
  data () {
    return {
    }
  },
  computed: {
    isGuest () {
      return this.$store.getters.currentUser().profile.role === 'GUEST'
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
