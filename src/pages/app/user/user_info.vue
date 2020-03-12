<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.justify-center.bg-grey-9
  //- dialogs
  //- settings
  q-dialog(v-model="userSettingsDialogOpened" :maximized="$q.screen.xs")
    user-settings(:value="user" @hide="userSettingsDialogOpened = false")
  //- TODO notifications, dm
  //- cover
  img(
    @click="userCoverClick()"
    src="https://www.ecopetit.cat/wpic/mpic/28-289473_twitter-cover-photo-45-stars.jpg"
    :style=`{position: 'absolute', bottom: '190px', objectFit: 'cover'}`).fit
  //- wrapper
  div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.q-pt-xl
    //- logo, db, notifications, follow
    .row.full-width.q-pa-sm
      kalpa-avatar(:url="user.profile.thumbUrl" :width="100" :height="100" @click.native="userAvatarClick()")
      .col.full-height
        .row.fit.items-center.content-center.justify-end
          q-btn(v-if="userIsMe" round flat color="green" icon="settings" @click="userSettingsDialogOpened = true").q-mr-sm
          q-btn(round dense outline color="green" icon="mail_outline" @click="userDM()").q-mr-sm
          q-btn(round dense outline color="green" icon="notifications_none" @click="userSetNotifications()").q-mr-sm
          q-btn(push no-caps color="green" @click="userFollow()"
            :style=`{borderRadius: '20px'}`).q-px-sm
            span.text-bold Follow
    //- name
    .row.full-width.items-center.content-center.q-px-sm
      span(:style=`{fontSize: '25px', lineHeight: '25px'}` @click="userNameClick()").text-white.text-bold {{user.name}}
      .row.full-width
        span(:style=`{padding: 0, margin: 0}` @click="userUsernameClick()").text-white @ivanmoto
    //- status/about
    .row.full-width.q-pa-sm
      span(:style=`{fontSize: '18px'}` @click="userStatusClick()").text-white.text-grey-4 😱 My status quo 😤
      .row.full-width
        span(@click="userAboutClick()").text-white.text-grey-4 Helping people to help them 😺
    //- pages
    .row.full-width
      kalpa-buttons(:value="pages" :id="page" idKey="id" @id="$emit('page', $event)")
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
