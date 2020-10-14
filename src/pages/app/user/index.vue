<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pt-sm
        div(:style=`{height: '60px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pl-md.q-pr-xs.b-40
          user-avatar(v-if="user" :url="user.profile.photoUrl" :width="36" :height="36")
          .col
            span(v-if="user").text-white.text-bold.q-ml-sm {{ user.name }}
          kalpa-follow(
              v-if="user && user.oid && !itsMe"
              :oid="user.oid")
        .row.full-width.q-px-md
          q-tabs(
            no-caps active-color="green" align="left"
            stretch :breakpoint="100" inline-label
            :switch-indicator="true").full-width.text-grey-8
            q-route-tab(
              v-for="t in pages" :key="t.id"
              inline-label
              :to="t.id" :name="t.id" :label="t.name" :icon="t.icon").q-px-sm
  q-page-container
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
        {id: 'created', name: this.$t('Nodes', 'Ядра'), icon: 'filter_tilt_shift'},
        {id: 'linked', name: this.$t('Links', 'Связи'), icon: 'link'},
        {id: 'voted', name: this.$t('Votes', 'Голоса'), icon: 'adjust'},
        {id: 'following', name: this.$t('Subscriptions', 'Подписки'), icon: 'rss_feed'},
        {id: 'followers', name: this.$t('Subscribers', 'Подписчики'), icon: 'supervisor_account'},
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
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
