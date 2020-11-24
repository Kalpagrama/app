<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal :style=`{paddingTop: 'env(safe-area-inset-top)',}`).b-30
    div(v-if="user").row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(:style=`{position: 'relative', height: '140px',}`).row.full-width
          img(
            v-if="user"
            draggable="false"
            :src="user.profile.photoUrl"
            :style=`{objectFit: 'cover', borderRadius: '0 0 10px 10px',}`
            ).fit
          div(
            v-if="itsMe"
            :style=`{position: 'absolute', zIndex: 100, bottom: '20px',}`
            ).row.full-width.items-center.content-center
            .col.q-pl-md
              q-tabs(
                :value="$route.name" @input="$router.push({name: $event})"
                no-caps active-color="green" align="left").full-width
                q-tab(
                  v-for="p in pagesMine" :key="p.id" :name="p.id" :label="p.name")
            q-btn(
              @click="$router.push({name: 'user.settings'})"
              round flat icon="settings"
              :color="$route.name === 'user.settings' ? 'green' : 'white'").q-mx-sm
          div(
            :style=`{
              position: 'absolute', bottom: '0px', zIndex: 90, transform: 'translate3d(0,0,0)', height: '70%',
              background: 'rgb(0,0,0)', background: 'linear-gradient(0deg, rgba(10,10,10,1) 0%, rgba(0,0,0,0) 100%)',
              borderRadius: '10px 10px 0 0', overflow: 'hidden', pointerEvents: 'none',
            }`).row.full-width
        div(:style=`{position: 'relative', zIndex: 100, height: '60px', borderRadius: '10px',marginTop: '-20px',paddingTop: '0px',}`
          ).row.full-width.items-center.content-center.justify-between.q-px-sm.b-40
          user-avatar(v-if="user" :url="user.profile.photoUrl" :width="36" :height="36")
          .col
            span(v-if="user").text-white.text-bold.q-ml-sm {{ user.name }}
          kalpa-share(
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
          q-btn(
            round flat color="grey-8" icon="more_vert")
            q-popup-proxy(
              maximized position="bottom" dark
              cover anchor="top right" self="top right").b-40
              div(
                :style=`{
                  borderRadius: '10px',
                }`
                ).row.full-width.items-start.content-start.b-40
                q-btn(
                  @click="a.cb()"
                  v-for="(a,akey) in actions" :key="akey"
                  flat no-caps
                  :color="a.color || 'white'"
                  :style=`{height: '50px',}`).full-width
                  span.text-bold {{ a.name }}
  q-page-container
    router-view(v-if="user" :user="user")
    //- component(
      :is="`page-${pageId}`"
      :user="user")
    //- q-page-sticky(
      expand position="top"
      :style=`{zIndex: 2000}`).row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-px-md.b-30
        q-tabs(
          no-caps active-color="green" align="left"
          stretch :breakpoint="100" inline-label
          :switch-indicator="true").full-width.text-grey-8
          q-route-tab(
            v-for="t in pages" :key="t.id"
            inline-label
            :to="t.id" :name="t.id" :label="t.name" :icon="t.icon").q-px-sm
    //- router-view(:oid="$route.params.oid")
</template>

<script>
import { UserApi } from 'src/api/user'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp__user',
  components: {
    pageProfile: () => import('./page_profile/index.vue'),
    pageSettings: () => import('./page_settings/index.vue'),
    pageWorkspace: () => import('./page_workspace/index.vue'),
  },
  data () {
    return {
      user: null,
      userSubscribed: null,
      pageId: 'profile',
    }
  },
  computed: {
    pagesMine () {
      return [
        {id: 'user', name: 'Профиль'},
        {id: 'user.workspace', name: 'Мастерская'},
        // {id: 'user.settings', name: 'Настройки'},
      ]
    },
    pages () {
      return [
        {id: 'feeds', name: this.$t('Collections', 'Коллекции'), icon: 'view_week'},
        {id: 'nodes', name: this.$t('Nodes', 'Ядра'), icon: 'filter_tilt_shift'},
        {id: 'joints', name: this.$t('Joints', 'Связи'), icon: 'link'},
        {id: 'votes', name: this.$t('Votes', 'Голоса'), icon: 'adjust'},
        {id: 'followers', name: this.$t('Subscribers', 'Подписчики'), icon: 'supervisor_account'},
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
  watch: {
    '$route.params.oid': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.oid TO', to)
        if (to) {
          this.user = null
          await this.$wait(300)
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
