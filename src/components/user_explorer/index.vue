<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  //- menu right
  div(
    v-if="$q.screen.width > 1260"
    :style=`{
      position: 'absolute', zIndex: 9999,
      right: -$store.state.ui.panelMaxWidth+'px',
      maxWidth: $store.state.ui.panelMaxWidth+'px',
      height: '300px',
    }`).row.full-width.justify-start.q-px-sm.q-pt-sm
    menu-right(:style=`{maxWidth: '240px'}`).b-50.fit
  q-layout(
    view="hHh lpR fFf"
    container :style=`{position: 'relative', height: $q.screen.height+'px', overflow: 'auto'}`).b-30
    //- drawer right
    q-drawer(
      v-model="showMenu" side="right"
      @before-show="showFooter = false"
      @before-hide="showFooter = true"
      )
      menu-right().full-height.b-50
    q-footer(
      v-if="$q.screen.width <= 1260"
      v-model="showFooter"
      reveal
      :style=`{
        zIndex: 9999,
        borderRadius: '10px 10px 0 0', overflow: 'hidden'
      }`
      ).row.full-width
      .row.full-width.q-pa-sm.b-50
        q-btn(round flat dense color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])")
        .col
        q-btn(round flat dense color="white" icon="menu_open" @click="showMenu = !showMenu")
    q-header(
      v-if="true"
      v-model="showHeader"
      reveal
      ).row.full-width
      div(:style=`{borderRadius: '0 0 10px 10px'}`).row.full-width.items-center.content-center.q-px-sm.q-pb-sm.b-50
        .row.full-width.items-center.content-center.q-py-md
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
          .col.full-height
            .row.fit.items-center.content-center
              kalpa-avatar(:url="user.profile.photoUrl" :width="36" :height="36").q-mr-sm
              span.text-white.text-bold {{ user.name }}
          q-btn(
            v-if="itsMe"
            round flat color="white" icon="tune")
        .row.full-width.items-end.content-end.justify-between
          kalpa-buttons(:value="pages" :id="$route.name" @id="$router.push({name: $event})").justify-start
          q-btn(
            v-if="!itsMe"
            no-caps dense color="green").q-px-md Follow
    q-page-container
      q-page
        router-view
</template>

<script>
import menuRight from './menu_right'
import userInfo from './user_info'
import userFollowers from './user_followers'
import userFollowing from './user_following'
import userCreated from './user_created'
import userVoted from './user_voted'

export default {
  name: 'userExplorer',
  components: {menuRight, userInfo, userVoted, userCreated, userFollowing, userFollowers},
  props: ['user'],
  data () {
    return {
      showMenu: false,
      showFooter: true,
      showHeader: true,
      pages: [
        {id: 'created', name: 'Created'},
        {id: 'voted', name: 'Voted'},
        // {id: 'following', name: 'Following'},
        // {id: 'followers', name: 'Followers'}
      ]
    }
  },
  computed: {
    pageId () {
      return this.$route.params.page
    },
    followers () {
      if (this.user && this.user.subscribers === null) return 0
      else return this.user.subscribers.length
    },
    following () {
      return this.$store.getters.currentUser().subscriptions
    },
    itsMe () {
      return this.$route.params.oid === this.$store.getters.currentUser().oid
    },
  },
  watch: {
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
