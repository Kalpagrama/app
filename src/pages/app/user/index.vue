<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm
        div(:style=`{height: '50px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pl-md.q-pr-xs.b-40
          user-avatar(v-if="user" :url="user.profile.photoUrl" :width="36" :height="36")
          .col
            span(v-if="user").text-white.text-bold.q-ml-sm {{ user.name }}
          q-btn(
            v-if="!itsMe && userSubscribed === false"
            @click="userFollow()"
            outline color="green" no-caps) Follow
          q-btn(
            v-if="!itsMe && userSubscribed === true"
            outline color="green" no-caps) Following
            q-menu(
              ref="userUnfollowMenu"
              dark anchor="bottom right" self="top right")
              div(
                :style=`{
                  maxWidth: '240px',
                  borderRadius: '10px', overflow: 'hidden',
                }`
                ).row.full-width.b-50.q-pa-md
                .row.full-width.q-pb-md
                  span.text-white Unfollow {{ user.name }}? You no longer see his posts.
                .row.full-width
                  q-btn(
                    @click="$refs.userUnfollowMenu.hide()"
                    flat no-caps).b-60 Cancel
                  .col
                  q-btn(
                    @click="userUnfollow()"
                    color="red" no-caps) Unfollow
          //- q-btn(round flat color="grey-8" icon="more_vert")
        .row.full-width.q-px-md
          q-tabs(
            no-caps dense active-color="white" align="left" :switch-indicator="true").full-width.text-grey-8
            q-route-tab(v-for="t in pages" :key="t.id" :to="t.id" :name="t.id" :label="t.name")
  q-page-container
    q-page(:style=`{paddingTop: '8px', paddingBottom: '200px'}`)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
          router-view(:oid="$route.params.oid")
</template>

<script>
import { UserApi } from 'src/api/user'
import { RxCollectionEnum } from 'src/system/rxdb'

import userFollowers from './user_followers'
import userFollowing from './user_following'
import userCreated from './user_created'
import userVoted from './user_voted'

export default {
  name: 'pageApp__user',
  components: {userCreated, userVoted, userFollowing, userFollowers},
  data () {
    return {
      user: null,
      userSubscribed: null,
      pageId: 'created',
    }
  },
  computed: {
    pages () {
      return [
        {id: 'created', name: this.$t('Nodes', 'Ядра')},
        {id: 'voted', name: this.$t('Votes', 'Голоса')},
        {id: 'following', name: this.$t('Subscriptions', 'Подписки')},
        {id: 'followers', name: this.$t('Subscribers', 'Подписчики')},
      ]
    },
    itsMe () {
      return this.$store.getters.currentUser().oid === this.$route.params.oid
    }
  },
  watch: {
    '$route.params.oid': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.oid TO', to)
        if (to) {
          this.user = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
          this.userSubscribed = await UserApi.isSubscribed(this.user.oid)
        }
      }
    },
  },
  methods: {
    async userFollow () {
      this.$log('userFollow')
      let res = await UserApi.subscribe(this.user.oid)
      await this.$wait(1000)
      this.userSubscribed = await UserApi.isSubscribed(this.user.oid)
      this.$log('res', res)
    },
    async userUnfollow () {
      this.$log('userUnfollow')
      let res = await UserApi.unSubscribe(this.user.oid)
      this.userSubscribed = await UserApi.isSubscribed(this.user.oid)
      await this.$wait(1000)
      this.$log('res', res)
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
