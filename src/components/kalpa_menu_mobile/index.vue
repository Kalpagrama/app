<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      borderRadius: '10px 10px 0 0',
      paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
    }`
    ).row.full-width.justify-between.b-40.q-px-sm.q-pt-sm
    q-btn(
      @click="$store.commit('ui/stateSet', ['listFeedNeedDrop', true])"
      flat no-caps icon="view_agenda"
      :to="'/feeds/all'"
      :color="$route.name.split('.')[0] === 'feeds' ? 'green' : 'white'"
      :style=`{
        width: size+'px',
        height: size+'px',
      }`
      ).row.items-center.content-center.justify-center
      .row.full-width.justify-center
        span(:style=`{whiteSpace: 'nowrap'}`) Лента
    q-btn(
      @click="$store.commit('ui/stateSet', ['listFeedNeedDrop', true])"
      flat icon="search" no-caps
      :to="'/trends'"
      :color="$route.name.split('.')[0] === 'trends' ? 'green' : 'white'"
      :style=`{
        width: size+'px',
        height: size+'px',
      }`)
      .row.full-width.justify-center
        span(:style=`{whiteSpace: 'nowrap'}`) Поиск
    //- workspace
    div(
      :style=`{
        width: size+'px',
        height: size+'px',
      }`
      ).row.items-center.content-center.justify-center
      q-btn(
        round no-caps icon="construction"
        :to="'/workspace'"
        :color="'green'"
        :style=`{width: '50px', height: '50px', borderRadius: '50%',}`)
    q-btn(
      @click="$store.commit('ui/stateSet', ['listFeedNeedDrop', true])"
      flat no-caps icon="notifications_none"
      :to="'/notifications/'"
      :color="$route.name.split('.')[0] === 'notifications' ? 'green' : 'white'"
      :style=`{
        width: size+'px',
        height: size+'px',
      }`)
      //- TODO: handle new notifications...
      //- q-badge(color="red" floating transparent) •
      .row.full-width.justify-center
        span Активность
        //- span Уведомления
    kalpa-menu-popup-global(
      :styles=`{
        width: size+'px',
        height: size+'px',
      }`)
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
    },
    size () {
      if (this.$q.screen.width > 350) return 60
      else return 50
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
