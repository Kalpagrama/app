<template lang="pug">
//- q-layout(
//-   view="hHh lpR fFf"
//-   container :style=`{height: $q.screen.height-20+'px'}`).b-30
//-   kalpa-menu-right
//-     menu-right(:user="user")
//-   q-header(v-if="false" reveal)
//-     .row.full-width.justify-center
//-       div(
//-         v-if="user"
//-         :style=`{
//-           height: '60px',
//-           maxWidth: $store.state.ui.maxWidthPage+'px'
//-         }`
//-         ).row.full-width.items-center.content-center.justify-start.q-px-sm
//-         span.text-bold.text-white {{ user.name }}
//-         .row.full-width
//-           small.text-white @{{ user.name }}
//-   kalpa-menu-footer(:options=`{showMenuPage: true}`)
//-     template(v-slot:menuRight)
//-       menu-right(:user="user")
//-   q-page-container
//-     q-page.row.full-width.justify-center
//-       div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width
//-         user-info(v-if="user" :user="user")
//-         component(:is="`user-${pageId}`")
div(:style=`{position: 'relative'}`).column.fit
  //- div().row.full-width
  //- menu right
  div(
    v-if="$q.screen.width > 1260"
    :style=`{
      position: 'absolute', zIndex: 1000,
      right: -$store.state.ui.panelMaxWidth+'px',
      maxWidth: $store.state.ui.panelMaxWidth+'px',
      height: '300px',
    }`).row.full-width.justify-start.q-px-sm.q-pt-sm
    menu-right(:style=`{maxWidth: '240px'}`).b-50.fit
  //- menu bottom
  div(
    v-if="$q.screen.width <= 1260"
    :style=`{
      position: 'absolute', zIndex: 9999, bottom: '0px',
      borderRadius: '10px 10px 0 0', overflow: 'hidden'
    }`
    ).row.full-width.q-pa-sm.b-50
    q-btn(round flat dense color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])")
  //- body
  div(:style=`{position: 'relative'}`).col.full-width.scroll
    //- user-info(v-if="user" :user="user")
    div(:style=`{}`).row.full-width.q-px-sm.b-50
      .row.full-width.items-center.content-center.q-py-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left")
        .col.full-height
          .row.fit.items-center.content-center
            kalpa-avatar(:url="user.profile.photoUrl" :width="36" :height="36").q-mr-sm
            span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ user.name }}
        q-btn(round flat color="white" icon="tune")
    div(
      :style=`{
        position: 'sticky', top: '0px', zIndex: 9999,
        borderRadius: '0 0 10px 10px', overflow: 'hidden',
      }`).row.full-width.b-50.q-px-sm.q-pb-sm
      kalpa-buttons(:value="pages" :id="$route.name" @id="$router.push({name: $event})").justify-start
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
      pages: [
        {id: 'created', name: 'Created'},
        {id: 'voted', name: 'Voted'},
        {id: 'following', name: 'Following'},
        {id: 'followers', name: 'Followers'}
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
    }
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
