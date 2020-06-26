<style lang="sass">
.q-tab
  border-radius: 8px !important
  overflow: hidden !important
</style>

<template lang="pug">
//- div(:style=`{position: 'relative'}`).row.fit
//-   //- menu right
//-   div(
//-     v-if="$q.screen.width > 1260"
//-     :style=`{
//-       position: 'absolute', zIndex: 9999,
//-       right: -$store.state.ui.panelMaxWidth+'px',
//-       maxWidth: $store.state.ui.panelMaxWidth+'px',
//-       height: '300px',
//-     }`).row.full-width.justify-start.q-px-sm.q-pt-sm
//-     menu-right(:style=`{maxWidth: '240px'}`).b-50.fit
//-   q-layout(
//-     view="hHh lpR fFf"
//-     container :style=`{position: 'relative', height: $q.screen.height+'px', overflow: 'auto'}`).b-30
//-     //- drawer right
//-     q-drawer(
//-       v-model="showMenu" side="right"
//-       @before-show="showFooter = false"
//-       @before-hide="showFooter = true"
//-       )
//-       menu-right().full-height.b-50
//-     q-footer(
//-       v-if="$q.screen.width <= 1260"
//-       v-model="showFooter"
//-       reveal
//-       :style=`{
//-         zIndex: 9999,
//-         borderRadius: '8px 8px 0 0', overflow: 'hidden'
//-       }`
//-       ).row.full-width
//-       .row.full-width.q-pa-sm.b-50
//-         q-btn(round flat color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])")
//-         .col
//-         q-btn(round flat color="white" icon="menu_open" @click="showMenu = !showMenu")
//-     q-header(
//-       v-if="true"
//-       v-model="showHeader"
//-       reveal
//-       ).row.full-width
//-       div(:style=`{borderRadius: '0 0 8px 8px'}`).row.full-width.items-center.content-center.b-50
//-         .row.full-width.items-center.content-center.q-py-md.q-px-sm
//-           q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
//-           .col.full-height
//-             .row.fit.items-center.content-center
//-               kalpa-avatar(:url="user.profile.photoUrl" :width="36" :height="36")
//-               span.text-white.text-bold.q-ml-sm {{ user.name }}
//-           q-btn(
//-             v-if="!itsMe"
//-             @click="userFollowToggle()"
//-             push color="green" no-caps
//-             ) Follow
//-         .row.full-width.items-end.content-end.justify-between
//-           //- kalpa-buttons(:value="pages" :id="$route.name" @id="$router.push({name: $event})").justify-start
//-           q-tabs(
//-             :value="$route.name" @input="pageChanged"
//-             align="justify"
//-             active-color="green"
//-             dense color="white"
//-             :style=`{borderRadius: $store.state.ui.borderRadius+'px'}`).full-width
//-             q-tab(
//-               v-for="(p,pkey) in pages" :key="pkey"
//-               :name="p.id"
//-               :label="p.name"
//-               no-caps content-class="text-white"
//-               :style=`{color: 'white'}`)
//-     q-page-container
//-       q-page
//-         router-view
kalpa-layout(:style=`{height: $q.screen.height+'px'}`)
  template(v-slot:header)
    div(:style=`{maxWidth: '800px', borderRadius: '0 0 10px 10px',}`).row.full-width.items-center.content-center.b-60
      .row.full-width.items-center.content-center.q-pa-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left")
        .col
          .row.fit.items-center.content-center
            kalpa-avatar(:url="user.profile.photoUrl" :width="36" :height="36")
            span.text-white.text-bold.q-ml-sm {{ user.name }}
        q-btn(v-if="!itsMe && !isSubscribed" push color="green" no-caps @click="userFollow()") Follow
        q-btn(v-if="!itsMe && isSubscribed" flat color="green" no-caps @click="userUnfollow()") Following
      .row.full-width.items-end.content-end
        q-tabs(
          :value="$route.name" @input="pageChanged"
          align="justify"
          active-color="green"
          dense color="white"
          :style=`{borderRadius: $store.state.ui.borderRadius+'px'}`).full-width
          q-tab(
            v-for="(p,pkey) in pages" :key="pkey"
            :name="p.id"
            :label="p.name"
            no-caps content-class="text-white"
            :style=`{color: 'white'}`)
  template(v-slot:footer)
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-center.content-center
      q-btn(round flat color="white" icon="menu")
      .col
      q-btn(round flat color="white" icon="menu_open")
  template(v-slot:drawerRight)
    menu-right(:style=`{maxWidth: '250px',}` :pages="pages")
  template(v-slot:page)
    router-view
</template>

<script>
import { UserApi } from 'src/api/user'

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
        {id: 'following', name: 'Following'},
        {id: 'followers', name: 'Followers'},
      ],
      isSubscribed: false,
    }
  },
  computed: {
    pageId () {
      return this.$route.params.page
    },
    itsMe () {
      return this.$route.params.oid === this.$store.getters.currentUser().oid
    },
  },
  watch: {
  },
  methods: {
    async userFollow () {
      this.$log('userFollow')
      let res = await UserApi.subscribe(this.user.oid)
      this.$log('res', res)
      this.isSubscribed = true
    },
    async userUnfollow () {
      this.$log('userUnfollow')
      if (!confirm(`Unfollow user ${this.user.name} ? `)) return
      let res = await UserApi.unSubscribe(this.user.oid)
      this.$log('res', res)
      this.isSubscribed = false
    },
    pageChanged (e) {
      this.$log('pageChanged', e)
      this.$router.push({name: e}).catch(e => e)
    }
  },
  async mounted () {
    this.$log('mounted')
    this.isSubscribed = await UserApi.isSubscribed(this.user.oid)
    this.$log('itsSubscribed', this.isSubscribed)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
