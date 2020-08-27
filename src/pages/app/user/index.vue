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
            v-if="!itsMe && !isSubscribed"
            outline color="green" no-caps) Follow
          q-btn(
            v-if="!itsMe && isSubscribed"
            outline color="green" no-caps) Following
          q-btn(round flat color="grey-8" icon="more_vert")
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
        }
      }
    },
  }
}
</script>
