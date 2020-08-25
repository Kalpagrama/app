<template lang="pug">
div(:style=`{}`).row.full-width.items-start.content-start.justify-center.b-30
  //- cover
  div(
    v-if="false"
    :class=`{
      'q-mt-sm': $q.screen.width > 600
    }`
    :style=`{
      position: 'relative', zIndex: 1000,
      height: '200px',
      borderRadius: $q.screen.width > 600 ? '10px' : '0px',
      backgroundImage: 'url(https://www.ecopetit.cat/wpic/mpic/28-289473_twitter-cover-photo-45-stars.jpg)'
    }`
    ).row.full-width.items-end.content-end.b-100
    q-btn(
      round flat color="white" icon="keyboard_arrow_left" @click="$router.back()"
      :style=`{position: 'absolute', zIndex: 2000, top: '8px', left: '8px'}`).b-40
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
      user-avatar(v-if="user" :url="user.profile.photoUrl" :width="40" :height="40" @click.native="userAvatarClick()")
      .col.full-height
        .row.fit.items-center.content-center.q-px-sm
          span(:style=`{fontSize: '25px', lineHeight: 0.9}` @click="userNameClick()").text-white.text-bold {{user.name}}
      q-btn(
        v-if="false || !userIsMe"
        push no-caps color="green" @click="userFollow()").q-px-sm
        span.text-bold {{$t('Subscribe', 'Подписаться')}}
  //- status
  div(
    v-if="false"
    :style=`{
      position: 'relative', zIndex: 100, borderRadius: '0 0 10px 10px', overflow: 'hidden',
      marginTop: '-20px', paddingTop: '30px'
    }`
    ).row.full-width.q-pa-sm.b-100
    p(:style=`{fontSize: '14px'}` @click="userStatusClick()").text-white 😱 My status quo 😤 <br> Helping people to help them 😺
  //- tabs
  div(
    :style=`{
      position: 'sticky', marginTop: '-20px', paddingTop: '20px', top: '0px',
      borderRadius: '0 0 10px 10px', overflow: 'hidden'}`
    ).row.full-width.q-pa-sm.b-50
    kalpa-buttons(:value="pages" :id="$route.params.page" @id="$router.push({params: {page: $event}})").justify-start
</template>

<script>
import userSettings from './user_settings'
import { UserApi } from 'src/api/user'

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
      return this.user.oid === this.$store.getters.currentUser().oid
    }
  },
  methods: {
    async userFollow () {
       try {
        this.$log('userFollow start', this.user.oid)
        let res = await UserApi.subscribe(this.user.oid)
        // this.user = await this.userLoad(this.$route.params.oid)
        this.$log('userFollow done', res)
      } catch (error) {
        this.$log('userFollow error', error)
      }
    },
    async userUnfollow () {
      try {
        this.$log('userUnfollow start')
        let res = await UserApi.unSubscribe(this.user.oid)
        // this.$delete(this.userSubscriptions, ss)
        // this.user = await this.userLoad(this.$route.params.oid)
        this.$log('userUnfollow done', res)
      } catch (error) {
        this.$log('userUnfollow error', error)
      }
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
