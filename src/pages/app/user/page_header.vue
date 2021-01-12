<template lang="pug">
.row.full-width.justify-center.b-30
  div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
    div(
      :style=`{
        position: 'relative', height: '140px',
        marginTop: '8px',
        borderRadius: '10px 10px 0 0',
        overflow: 'hidden',
      }`).row.full-width
      img(
        v-if="user"
        draggable="false"
        :src="user.profile.photoUrl"
        :style=`{objectFit: 'cover', borderRadius: '0 0 10px 10px',}`
        ).fit
      //- div(
        v-if="itsMe"
        :style=`{position: 'absolute', zIndex: 100, bottom: '20px',}`
        ).row.full-width.items-center.content-center
        .col.q-pl-md
          q-tabs(
            :value="$route.name" @input="$router.push({name: $event})"
            no-caps active-color="green" align="left").full-width.text-white
            q-tab(
              v-for="p in pagesMine" :key="p.id" :name="p.id" :label="p.name")
        q-btn(
          @click="$router.push({name: 'user.settings'})"
          round flat icon="settings"
          :color="$route.name === 'user.settings' ? 'green' : 'white'").q-mx-sm
      div(
        :style=`{
          position: 'absolute', bottom: '0px', zIndex: 90, transform: 'translate3d(0,0,0)', height: '70%',
          background: 'rgb(0,0,0)', background: 'linear-gradient(0deg, rgba(10,10,10,1) 30%, rgba(0,0,0,0) 100%)',
          borderRadius: '10px 10px 0 0', overflow: 'hidden', pointerEvents: 'none',
        }`).row.full-width
    div(:style=`{position: 'relative', zIndex: 100, height: '60px', borderRadius: '10px',marginTop: '-20px',paddingTop: '0px',}`
      ).row.full-width.items-center.content-center.justify-between.q-px-sm.b-40
      q-btn(
        @click="$routerKalpa.back()"
        round flat color="white" icon="west"
        )
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
