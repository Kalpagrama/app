<template lang="pug">
.row.full-width.justify-center
  div(
    v-if="isGuest"
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      borderRadius: '10px 10px 0 0',
    }`
    ).row.full-width.justify-between.b-40.q-px-xs.q-pb-xs.q-pt-sm
    q-btn(
      flat icon="explore" no-caps
      :to="'/trends'"
      :color="'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small(:style=`{whiteSpace: 'nowrap'}`) Новое
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
      :style=`{
        width: '60px',
      }`
      ).row.items-center.content-center.justify-center
      kalpa-logo(:width="23" :height="23" :style=`{pointEvents: 'none'}`).q
      .row.full-width.justify-center.q-pt-xs
        small(:style=`{whiteSpace: 'nowrap'}`).text-grey-7 Лента
    q-btn(
      flat icon="explore" no-caps
      :to="'/trends'"
      :color="'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small(:style=`{whiteSpace: 'nowrap'}`) Новое
    q-btn(
      no-caps icon="add" size="lg"
      :to="'/workspace/create'"
      :color="'green'"
      :style=`{width: '50px', height: '50px', borderRadius: '50%',}`)
    q-btn(
      flat no-caps icon="bookmark_outline"
      :to="'/workspace/'"
      :color="pageId === 'similar' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Закладки
    q-btn(
      @click="$store.commit('ui/stateSet', ['mobileMenuShow', true])"
      flat icon="menu" no-caps
      :color="$store.state.ui.mobileMenuShow ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Меню
//- .row.full-width.justify-center
  div(
    v-if="isGuest"
    :style=`{maxWidth: 700+'px', borderRadius: '10px 10px 0 0'}`
    ).row.full-width.items-center.content-center.justify-between.q-pt-sm.q-pb-xs.b-40
    .row.full-height.items-center.content-center.justify-center
      q-btn(
        round flat dense color="white" icon="explore"
        :to="'/trends'")
      .row.full-width.justify-center
            small.text-grey-6 Новое
    q-btn(
      :to="'/auth'"
      flat color="white" no-caps
      :style=`{
        height: '44px',
      }`).q-px-md.b-50
      span.text-white Войти
    .row.full-height.items-center.content-center.justify-center
      q-btn(
        @click="$store.commit('ui/stateSet', ['mobileMenuShow', true])"
        round flat dense color="white" icon="menu")
      .row.full-width.justify-center
        small.text-grey-6 Меню
  div(
    v-if="!isGuest"
    :style=`{maxWidth: 700+'px', borderRadius: '10px 10px 0 0'}`
    ).row.full-width.items-center.content-center.justify-between.q-pt-sm.q-pb-xs.b-40
    router-link(:to="{name: 'feeds'}").col
      .row.full-height.items-center.content-center.justify-center
        q-btn(
          round flat dense icon="home"
          :color="$route.name.split('.')[0] === 'feeds' ? 'green' : 'grey-4'")
        .row.full-width.justify-center
          small.text-grey-6 Домашняя
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
