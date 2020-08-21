<style lang="sass">
// .q-tab
//   border-radius: 8px !important
//   overflow: hidden !important
</style>

<template lang="pug">
div(:style=`{position: 'relative',}`).column.fit
  //- header
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, top: '0px',
    }`).row.full-width.justify-center
    div(:style=`{maxWidth: '800px', borderRadius: '0 0 10px 10px', overflow: 'hidden'}`).row.full-width.items-center.content-center.b-50
      .row.full-width.items-center.content-center.q-pt-sm.q-px-sm
        kalpa-avatar(:url="user.profile.photoUrl" :width="36" :height="36")
        .col
          span.text-white.text-bold.q-ml-sm {{ user.name }}
        q-btn(v-if="!itsMe && !isSubscribed" color="green" no-caps @click="userFollow()") {{$t('Subscribe', 'Подписаться')}}
        q-btn(v-if="!itsMe && isSubscribed" flat color="green" no-caps @click="userUnfollow()") {{$t('Unsubscribe', 'Отписаться')}}
        //- q-btn(round flat color="white" icon="menu_open")
      .row.full-width
        q-tabs(v-model="tab" no-caps dense active-color="green").full-width.text-grey-4
          q-tab(v-for="t in pages" no-caps dense :key="t.id" :name="t.id" :label="t.name")
  //- body
  .col.full-width
    q-tab-panels(
      v-model="tab"
      swipeable infinite animated
      :style=`{padding: 0, margin: 0, background: 'none'}`).fit
      q-tab-panel(name="created" :style=`{padding: 0, margin: 0, background: 'none'}`)
        user-created()
      q-tab-panel(name="voted" :style=`{padding: 0, margin: 0, background: 'none'}`)
        user-voted()
      q-tab-panel(name="following" :style=`{padding: 0, margin: 0, background: 'none'}`)
        user-subscriptions(:oid="$route.params.oid" :style=`{paddingTop: '80px',}`)
      q-tab-panel(name="followers" :style=`{padding: 0, margin: 0, background: 'none'}`)
        user-followers()
</template>

<script>
import { UserApi } from 'src/api/user'

import menuRight from './menu_right'
import userInfo from './user_info'
import userFollowers from './user_followers'
import userFollowing from './user_following'
import userCreated from './user_created'
import userVoted from './user_voted'

import userSubscriptions from 'components/user_subscriptions/index.vue'

export default {
  name: 'userExplorer',
  components: {menuRight, userInfo, userVoted, userCreated, userSubscriptions, userFollowers},
  props: ['user'],
  data () {
    return {
      showMenu: false,
      showFooter: true,
      showHeader: true,
      isSubscribed: false,
      tab: 'created',
    }
  },
  computed: {
    pageId () {
      return this.$route.params.page
    },
    pages () {
      return [
        {id: 'created', name: this.$t('Nodes', 'Ядра')},
        {id: 'voted', name: this.$t('Votes', 'Голоса')},
        {id: 'following', name: this.$t('Subscriptions', 'Подписки')},
        {id: 'followers', name: this.$t('Subscribers', 'Подписчики')},
      ]
    },
    pagesHot () {
      return this.pages.filter(p => ['created', 'voted'].includes(p.id))
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
