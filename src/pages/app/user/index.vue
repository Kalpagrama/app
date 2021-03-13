<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  @scroll="onScroll")
  //- nav-tabs(
    v-if="user && scrollPosition > 265"
    :tabs="tabs"
    :style=`{
      position: 'fixed', zIndex: 1000, top: '0px',
    }`)
  q-header(
    v-if="user && scrollTop > 300"
    reveal)
    nav-tabs(:tabs="tabs")
  q-page-container
    q-page(
      :style=`{
        //- paddingTop: '300px',
      }`
      ).row.full-width.justify-center
      component(
        v-if="user"
        :is="`page-${$route.params.page}`"
        :user="user"
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`)
        template(v-slot:prepend)
          div(v-if="user").row.full-width
            nav-header(:user="user")
            nav-tabs(:tabs="tabs")
</template>

<script>
import { UserApi } from 'src/api/user'
import { RxCollectionEnum } from 'src/system/rxdb'

import navHeader from './nav_header.vue'
import navTabs from './nav_tabs.vue'

import pageNodes from './page_nodes/index.vue'
import pageJoints from './page_joints/index.vue'
import pageVotes from './page_votes/index.vue'
import pageFollowing from './page_following/index.vue'
import pageFollowers from './page_followers/index.vue'

export default {
  name: 'pageApp__user',
  components: {
    navHeader,
    navTabs,
    pageNodes,
    pageJoints,
    pageVotes,
    pageFollowers,
    pageFollowing,
  },
  data () {
    return {
      user: null,
      scrollTop: 0,
    }
  },
  computed: {
    tabs () {
      return [
        // {id: 'collections', name: 'Коллекции', icon: 'folder_special', count: 11},
        {id: 'nodes', name: 'Ядра', icon: 'panorama_fish_eye', count: 356},
        {id: 'joints', name: 'Связи', icon: 'panorama_fish_eye', count: 356},
        {id: 'votes', name: this.$t('Votes', 'Голоса'), icon: 'adjust', count: 12},
      ]
    },
  },
  watch: {
    '$route.params.oid': {
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.user = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
          if (!this.$route.params.page) {
            this.$router.replace({params: {page: 'nodes'}})
          }
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
