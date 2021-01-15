<template lang="pug">
.row.full-width.justify-center.b-30
  //- user thumbUrl cover ?
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
          //- borderRadius: '0 0 10px 10px',
        }`
        ).fit
      kalpa-menu-actions(
        :title="user.name"
        :actions="actions" icon="more_vert"
        color="white"
        :style=`{
          position: 'absolute', zIndex: 200, top: '8px', right: '8px',
        }`).q-mr-xs
      q-btn(
        v-if="$q.screen.lt.md"
        @click="$store.commit('ui/stateSet', ['mobileMenuShow', true])"
        round flat color="white" icon="menu"
        :style=`{
          position: 'absolute', zIndex: 200, top: '8px', left: '8px',
        }`)
      div(
        :style=`{
          position: 'absolute', bottom: '0px', zIndex: 90, transform: 'translate3d(0,0,0)', height: '100%',
          //- background: 'rgb(0,0,0)',
          background: 'linear-gradient(0deg, rgba(30,30,30,1) 10%, rgba(0,0,0,0) 100%)',
          //- borderRadius: '10px 10px 0 0',
          overflow: 'hidden', pointerEvents: 'none',
        }`).row.full-width
    //- header
    div(
      :style=`{
        position: 'relative', zIndex: 100,
        minHeight: '60px',
        borderRadius: '10px',
        marginTop: '-20px',
        paddingTop: '0px',
      }`
      ).row.full-width.items-center.content-center.justify-between.q-px-sm.b-40
      //- header: back, avatar, name, rating
      div(:style=`{height: '60px',}`).row.full-width.items-center.content-center.justify-between
        q-btn(
          @click="$router.back()"
          round flat color="white" icon="west")
        user-avatar(v-if="user" :url="user.profile.photoUrl" :width="36" :height="36")
        .col
          span(v-if="user" :style=`{}`).text-white.text-bold.q-ml-sm {{ user.name }}
          .row.full-width.q-px-sm
            //- small(v-if="user" :style=`{lineHeight: 0.8}`).text-grey-4 {{ Math.round(user.weightVal) }}
            small(:style=`{lineHeight: 0.8}`).text-white @{{ user.username }}
        q-btn(
          v-if="true || !itsMe"
          @click="followToggle()"
          outline color="green" no-caps)
          span Подписаться
      //- about user
      .row.full-width.q-px-sm.q-pb-sm
        .row.full-width
          p.text-grey-2 status lorem ipsum lorem ipsum lorem ipsum status lorem ipsum lorem ipsum lorem ipsum status lorem
        .row.full-width.q-pb-sm
          //- weight
          router-link(
            :to=`{params: {tab: 'weight'}}`
            ).row.full-height.items-center.content-center
            span.text-white.q-mr-xs 1231
            span.text-grey-7.q-mr-md Вес
          //- following
          router-link(
            :to=`{params: {tab: 'following'}}`
            ).row.full-height.items-center.content-center
            span.text-white.q-mr-xs 1419
            span.text-grey-7.q-mr-md Подписки
          //- followers
          router-link(
            :to=`{params: {tab: 'followers'}}`
            ).row.full-height.items-center.content-center
            span.text-white.q-mr-xs 9293
            span.text-grey-7 Подписчики
</template>

<script>
export default {
  name: 'pageApp_user_pageHeader',
  props: ['user'],
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
  methods: {
    followToggle () {
      this.$log('followToggle')
    }
  }
}
</script>
