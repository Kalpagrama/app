<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30.q-pt-sm.q-px-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
        div(:style=`{height: '60px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-px-sm.b-40
          user-avatar(v-if="user" :url="user.profile.photoUrl" :width="36" :height="36")
          .col
            span(v-if="user").text-white.text-bold.q-ml-sm {{ user.name }}
          kalpa-bookmark(
            v-if="user && !itsMe"
            :oid="user.oid"
            type="USER"
            :name="user.name"
            :thumbUrl="user.thumbUrl"
            :isActive="true")
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
        {id: 'joints', name: this.$t('Joints', 'Связи'), icon: 'link'},
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
