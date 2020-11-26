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
            .col.q-pl-sm
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
              background: 'rgb(0,0,0)', background: 'linear-gradient(0deg, rgba(10,10,10,1) 30%, rgba(0,0,0,0) 100%)',
              borderRadius: '10px 10px 0 0', overflow: 'hidden', pointerEvents: 'none',
            }`).row.full-width
        div(:style=`{position: 'relative', zIndex: 100, height: '60px', borderRadius: '10px',marginTop: '-20px',paddingTop: '0px',}`
          ).row.full-width.items-center.content-center.justify-between.q-px-sm.b-40
          user-avatar(v-if="user" :url="user.profile.photoUrl" :width="36" :height="36")
          .col
            span(v-if="user" :style=`{}`).text-white.text-bold.q-ml-sm {{ user.name }}
            .row.full-width.q-px-sm
              small(v-if="user" :style=`{lineHeight: 0.8}`).text-grey-4 {{ Math.round(user.weightVal) }}
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
          kalpa-menu-actions(:actions="actions" icon="more_vert").q-mr-xs
  q-page-container(v-if="user")
    router-view(:user="user" :key="user.oid")
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
        if (to) {
          this.$log('$route.params.oid TO', to)
          // this.user = null
          // await this.$wait(300)
          this.user = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
          // this.userSubscribed = await UserApi.isSubscribed(this.user.oid)
        }
      }
    }
  }
}
</script>
