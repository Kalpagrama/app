<template lang="pug">
q-layout(view="hHh Lpr lff")
  //- q-header(reveal :style=`{paddingTop: 'env(safe-area-inset-top)',}`).b-30
  q-page-container(v-if="user")
    router-view(:user="user" :key="user.oid")
      template(v-slot:prepend)
        page-header(:user="user")
</template>

<script>
import { UserApi } from 'src/api/user'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp__user',
  components: {
    pageHeader: () => import('./page_header.vue'),
    pageProfile: () => import('./page_profile/index.vue'),
    pageSettings: () => import('./page_settings/index.vue'),
    pageWorkspace: () => import('./page_workspace/index.vue'),
  },
  data () {
    return {
      user: null,
    }
  },
  watch: {
    '$route.params.oid': {
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.$log('$route.params.oid TO', to)
          this.user = null
          await this.$wait(300)
          this.user = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
          // this.userSubscribed = await UserApi.isSubscribed(this.user.oid)
        }
      }
    }
  },
  mounted () {
    document.body.style.background = 'rgb(30,30,30)'
  }
}
</script>
