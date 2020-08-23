<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.b-30
        div(:style=`{height: '50px'}`).row.full-width.items-center.content-center.justify-between.q-px-md
          user-avatar(v-if="user" :url="user.profile.photoUrl" :width="36" :height="36")
          .col
            span(v-if="user").text-white.text-bold.q-ml-sm {{ user.name }}
          //- q-btn(v-if="!itsMe && !isSubscribed" color="green" no-caps @click="userFollow()") {{$t('Subscribe', 'Подписаться')}}
          //- q-btn(v-if="!itsMe && isSubscribed" flat color="green" no-caps @click="userUnfollow()") {{$t('Unsubscribe', 'Отписаться')}}
  q-page-container
    q-page(:style=`{paddingTop: '50px', paddingBottom: '200px'}`)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
          q-tab-panels(
            v-model="pageId"
            swipeable infinite animated
            :style=`{padding: 0, margin: 0, background: 'none', minHeight: '100vh'}`).full-width
            q-tab-panel(
              v-for="p in pages" :key="p.id" :name="p.id" :style=`{padding: 0, margin: 0, background: 'none', minHeight: '100vh'}`)
              component(:is="`user-${p.id}`" :oid="$route.params.oid")
      //- pages navigation top
      q-page-sticky(expand position="top" :style=`{zIndex: 1000}`)
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: '800px'}`).row.full-width.q-px-md
            q-tabs(v-model="pageId" no-caps dense active-color="white" align="left" switch-indicator).text-grey-8
              q-tab(v-for="t in pages" :key="t.id" :name="t.id" :label="t.name")
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
