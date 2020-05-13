<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.justify-center.bg-grey-10
  //- cover
  .row.full-width.justify-center
    div(:style=`{position: 'relative', height: '300px', maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.q-pt-sm
      //- actions
      q-btn(
        round flat color="white" icon="keyboard_arrow_left" @click="$router.back()"
        :style=`{position: 'absolute', zIndex: 100, top: '16px', left: '8px'}`)
      //- tint
      div(:style=`{position: 'absolute', zIndex: 10, borderRadius: '10px', background: 'rgba(0,0,0,0.2)'}`).row.fit
      img(
        @click="userCoverClick()"
        src="https://www.ecopetit.cat/wpic/mpic/28-289473_twitter-cover-photo-45-stars.jpg"
        :style=`{position: 'absolute', objectFit: 'cover', borderRadius: '10px', overflow: 'hidden'}`).fit
      //- what
      div(:style=`{position: 'absolute', zIndex: 100, bottom: '0px', height: '100px'}`).row.full-width.q-px-md
        kalpa-avatar(:url="user.profile.photoUrl" :width="100" :height="100" @click.native="userAvatarClick()")
        .col.full-height
          .row.fit.items-center.content-center.q-px-sm
            span(:style=`{fontSize: '25px', lineHeight: 0.9}` @click="userNameClick()").text-white.text-bold {{user.name}}
            .row.full-width
              span(:style=`{padding: 0, margin: 0}` @click="userUsernameClick()").text-white @ivanmoto
      //- what
      div(:style=`{position: 'absolute', zIndex: 200, bottom: '0px', height: '50px'}`
        ).row.full-width.items-center.content-center.justify-end.q-px-sm
          //- TODO show after u followed this user...
          //- q-btn(round push dense color="green" icon="mail_outline" @click="userDM()").q-mr-sm
          //- q-btn(round push dense color="green" icon="notifications_none" @click="userSetNotifications()").q-mr-sm
          q-btn(
            v-if="!userIsMe"
            push no-caps color="green" @click="userFollow()").q-px-sm
            span.text-bold Follow
  //- status
  .row.full-width.justify-center
    div(
      :style=`{maxWidth: $store.state.ui.maxWidthPage+'px', borderRadius: '0 0 10px 10px', overflow: 'hidden'}`
      ).row.full-width.q-pa-md.bg-grey-9
      p(:style=`{fontSize: '14px'}` @click="userStatusClick()").text-white.text-grey-4 😱 My status quo 😤 <br> Helping people to help them 😺
</template>

<script>
import userSettings from './user_settings'

export default {
  name: 'pageAppUser_userInfo',
  components: { userSettings },
  props: ['user', 'page'],
  data () {
    return {
      userSettingsDialogOpened: false,
      pages: [
        {id: 'created', name: 'Created'},
        {id: 'voted', name: 'Voted'},
        {id: 'following', name: 'Following'},
        {id: 'followers', name: 'Followers'}
      ]
    }
  },
  computed: {
    userIsMe () {
      return this.user.oid === this.$store.getters.currentUser.oid
    }
  },
  methods: {
    userSetNotifications () {
      this.$log('userSetNotifications')
    },
    userDM () {
      this.$log('userDM')
    },
    async userFollow () {
       try {
        this.$log('userFollow start', this.user.oid)
        let res = await this.$store.dispatch('user/subscribe', this.user.oid)
        // this.user = await this.userLoad(this.$route.params.oid)
        this.$log('userFollow done', res)
      } catch (error) {
        this.$logD('userFollow error', error)
      }
    },
    async userUnfollow () {
      try {
        this.$log('userUnfollow start')
        let res = await this.$store.dispatch('user/unSubscribe', this.user.oid)
        // this.$delete(this.userSubscriptions, ss)
        // this.user = await this.userLoad(this.$route.params.oid)
        this.$logD('userUnfollow done', res)
      } catch (error) {
        this.$logD('userUnfollow error', error)
      }
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
