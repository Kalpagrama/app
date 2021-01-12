<template lang="pug">
.row.full-width.justify-center.b-30
  //- user thumbUrl cover ?
  div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
    div(
      :style=`{
        position: 'relative', height: '140px',
        //- borderRadius: '10px 10px 0 0',
        //- overflow: 'hidden',
        //- marginTop: '8px',
      }`).row.full-width
      img(
        v-if="user"
        draggable="false"
        :src="user.profile.photoUrl"
        :style=`{
          objectFit: 'cover',
          //- borderRadius: '0 0 10px 10px',
        }`
        ).fit
      div(
        :style=`{
          position: 'absolute', bottom: '0px', zIndex: 90, transform: 'translate3d(0,0,0)', height: '100%',
          //- background: 'rgb(0,0,0)',
          background: 'linear-gradient(0deg, rgba(30,30,30,1) 10%, rgba(0,0,0,0) 100%)',
          //- borderRadius: '10px 10px 0 0',
          overflow: 'hidden', pointerEvents: 'none',
        }`).row.full-width
    //- header: back, avatar, name, rating, options, menu caller
    div(
      :style=`{position: 'relative', zIndex: 100, height: '60px', borderRadius: '10px',marginTop: '-20px',paddingTop: '0px',}`
      ).row.full-width.items-center.content-center.justify-between.q-px-sm.b-40
      q-btn(
        @click="$router.back()"
        round flat color="white" icon="west")
      user-avatar(v-if="user" :url="user.profile.photoUrl" :width="36" :height="36")
      .col
        span(v-if="user" :style=`{}`).text-white.text-bold.q-ml-sm {{ user.name }}
        .row.full-width.q-px-sm
          small(v-if="user" :style=`{lineHeight: 0.8}`).text-grey-4 {{ Math.round(user.weightVal) }}
      //- kalpa-share(
        v-if="user"
        type="user" :item="user")
      kalpa-bookmark(
        v-if="user && !itsMe"
        :oid="user.oid"
        type="USER"
        inactiveColor="grey-8"
        :name="user.name"
        :thumbUrl="user.thumbUrl"
        :isActive="true")
      kalpa-menu-actions(:actions="actions" icon="more_vert").q-mr-xs
      //- menu caller
      q-btn(
        v-if="$q.screen.lt.md"
        @click="$store.commit('ui/stateSet', ['mobileMenuShow', true])"
        round flat color="white" icon="menu")
</template>

<script>
export default {
  name: 'pageApp_user_pageHeader',
  props: ['user'],
  computed: {
    pagesMine () {
      return [
        {id: 'user', name: 'Профиль'},
        {id: 'user.workspace', name: 'Мастерская'},
        // {id: 'user.settings', name: 'Настройки'},
      ]
    },
    itsMe () {
      return this.$store.getters.currentUser().oid === this.$route.params.oid
    },
    actions () {
      return {
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
}
</script>
