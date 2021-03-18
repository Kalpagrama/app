<template lang="pug">
kalpa-layout
  template(v-slot:header=`{scrollTop}`)
    nav-tabs(:user="user" v-if="scrollTop > 226")
  template(v-slot:footer)
    kalpa-menu-mobile
  template(v-slot:body)
    .row.full-width.items-start.content-start
      div(
        v-if="user"
        ).row.full-width.items-start.content-start.justify-center
        nav-header(:user="user")
        nav-tabs(:user="user")
        router-view(
          :user="user"
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px',
          }`)
//- q-layout(
  view="hHh lpR fFf"
  :container="false"
  :style=`{
    height: $q.screen.height+'px',
  }`
  @scroll="onScroll").b-30
  q-header(
    v-if="user && scrollTop > 300"
    reveal)
    nav-tabs(:user="user")
  q-footer(v-if="$q.screen.lt.md")
    kalpa-menu-mobile
  q-page-container
    q-page(
      v-if="user"
      ).row.full-width.items-start.content-start.justify-center
      nav-header(:user="user")
      nav-tabs(:user="user")
      router-view(
        :user="user"
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`)
</template>

<script>
import { UserApi } from 'src/api/user'
import { RxCollectionEnum } from 'src/system/rxdb'

import navHeader from './nav_header.vue'
import navTabs from './nav_tabs.vue'

export default {
  name: 'pageApp__user',
  components: {
    navHeader,
    navTabs,
  },
  data () {
    return {
      user: null,
      scrollTop: 0,
    }
  },
  watch: {
    '$route.params.oid': {
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.user = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
          // if (!this.$route.params.page) this.$router.replace('nodes')
        }
      }
    }
  },
  methods: {
    onScroll (e) {
      // this.$log('onScroll', e.position)
      this.scrollTop = e.position
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
