<template lang="pug">
.row.full-width.justify-center.b-30
  //- TODO: user thumbUrl cover ?
  div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
    div(
      :style=`{
        position: 'relative', height: '140px',
      }`).row.full-width
      img(
        v-if="user"
        draggable="false"
        :src="user.profile.photoUrl"
        :style=`{
          objectFit: 'cover',
        }`
        ).fit
      div(
        :style=`{
          position: 'absolute', zIndex: 200, top: '0px',
          paddingTop: 'calc(8px + env(safe-area-inset-top))',
        }`
        ).row.full-width.justify-between.q-px-sm
        q-btn(
          @click="$router.back()"
          round flat color="white" icon="west"
          )
        kalpa-menu-actions(
          :title="user.name"
          :actions="actions" icon="more_vert"
          color="white"
          )
      div(
        :style=`{
          position: 'absolute', bottom: '0px', zIndex: 90, transform: 'translate3d(0,0,0)', height: '100%',
          background: 'rgba(0,0,0,0.5)',
          overflow: 'hidden', pointerEvents: 'none',
        }`).row.full-width
    //- header
    div(
      :style=`{
        position: 'relative', zIndex: 100,
        minHeight: '60px',
        borderRadius: '20px',
        marginTop: '-30px',
        paddingTop: '0px',
      }`
      ).row.full-width.items-center.content-center.justify-between.q-px-sm.b-40
      //- header: back, avatar, name, rating
      div(:style=`{height: '50px',}`).row.full-width.items-center.content-center.justify-between
        user-avatar(v-if="user" :url="user.profile.photoUrl" :width="36" :height="36")
        .col
          span(v-if="user" :style=`{}`).text-white.text-bold.q-ml-sm {{ user.name }}
          .row.full-width.q-px-sm
            small(:style=`{lineHeight: 0.9}`).text-grey-4 @username
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          q-btn(
            v-if="followingConfirmed && !itsMe"
            @click="followingToggle()"
            outline no-caps
            :color="following ? 'red' : 'green'"
            :style=`{
              borderRadius: '30px',
            }`)
            span {{ following ? $t('Unfollow') : $t('Follow') }}
      //- about user
      .row.full-width.q-px-sm
        div(
          v-if="user.profile.status"
          ).row.full-width
          p.text-grey-2 {{ user.profile.status }}
        //- stat fields
        .row.full-width.q-pb-sm
          //- weight
          div(
            ).row.items-end.content-end
            span.text-white.q-mr-xs {{ user.weightVal }}
            small.text-grey-7.q-mr-md R
          //- following
          router-link(
            :to=`'following'`
            ).row.items-end.content-end
            span.text-white.q-mr-xs {{ user.countStat.countSubscriptions }}
            small.text-grey-7.q-mr-md {{$t('Following')}}
          //- followers
          router-link(
            :to=`'followers'`
            ).row.items-end.content-end
            span.text-white.q-mr-xs {{ user.countStat.countSubscribers }}
            small.text-grey-7 {{$t('Followers')}}
</template>

<script>
import { UserApi } from 'src/api/user'

export default {
  name: 'pageApp_user_pageHeader',
  props: ['user'],
  data () {
    return {
      followingConfirmed: false,
      following: null,
    }
  },
  computed: {
    itsMe () {
      return this.$store.getters.currentUser().oid === this.$route.params.oid
    },
    actions () {
      return {
        copyLink: {
          name: 'Скопировать ссылку',
          cb: () => {
            this.$log('copyLink...')
          }
        },
        share: {
          name: 'Поделиться',
          cb: () => {
            this.$log('share...')
          }
        },
        report: {
          name: 'Пожаловаться',
          color: 'red',
          cb: () => {
            this.$log('report...')
          }
        }
      }
    }
  },
  watch: {
    user: {
      immediate: true,
      async handler (to, from) {
        this.$log('user TO')
        if (to) {
          this.following = await UserApi.isSubscribed(to.oid)
          this.followingConfirmed = true
        }
      }
    }
  },
  methods: {
    async followingToggle () {
      this.$log('followingToggle')
      let following = await UserApi.isSubscribed(this.user.oid)
      if (following) {
        this.following = false
        await UserApi.unSubscribe(this.user.oid)
      }
      else {
        this.following = true
        await UserApi.subscribe(this.user.oid)
      }
      // TODO: handle await for real data from this query
      // this.following = await UserApi.isSubscribed(this.user.oid)
      // this.followingConfirmed = true
    }
  }
}
</script>
