<style lang="sass">
.q-tab
  border-radius: 8px !important
  overflow: hidden !important
</style>

<template lang="pug">
kalpa-layout(
  :title="user ? user.name : ''"
  :pageId="$route.name" :pages="pages" :pagesHot="pagesHot"
  @pageId="$router.push({name: $event})"
  :style=`{height: $q.screen.height+'px'}`)
  template(v-slot:header)
    div(:style=`{maxWidth: '800px', borderRadius: '0 0 10px 10px',}`).row.full-width.items-center.content-center.b-60
      .row.full-width.items-center.content-center.q-pa-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left")
        .col
          .row.fit.items-center.content-center
            kalpa-avatar(:url="user.profile.photoUrl" :width="36" :height="36")
            span.text-white.text-bold.q-ml-sm {{ user.name }}
        q-btn(v-if="!itsMe && !isSubscribed" push color="green" no-caps @click="userFollow()") {{$t('Follow')}}
        q-btn(v-if="!itsMe && isSubscribed" flat color="green" no-caps @click="userUnfollow()") {{$t('Following')}}
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
      pagesHot: [
        {id: 'created', name: 'Created'},
        {id: 'voted', name: 'Voted'},
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
