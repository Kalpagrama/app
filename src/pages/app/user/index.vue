<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    div(v-if="user").row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        page-header(:user="user")
        div(
          :style=`{
            position: 'sticky', top: '0px',
            zIndex: 2000,
            transform: 'translate3d(0,0,100px)',
          }`
          ).row.full-width.justify-center.b-30
          div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width.q-px-md
            q-tabs(
              no-caps active-color="green" align="justify"
              stretch :breakpoint="100" inline-label
              :switch-indicator="true").full-width.text-grey-8
              //- t.name +' '+ t.count
              q-route-tab(
                v-for="t in tabs" :key="t.id"
                inline-label
                :to="t.id" :name="t.id" :label="t.name").q-px-sm
  q-page-container
    q-page.row.full-width.justify-center
      component(
        v-if="user"
        :is="`page-${$route.params.page}`"
        :user="user"
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`)
</template>

<script>
import { UserApi } from 'src/api/user'
import { RxCollectionEnum } from 'src/system/rxdb'

import pageHeader from './page_header.vue'

import pageNodes from './page_nodes/index.vue'
import pageJoints from './page_joints/index.vue'
import pageVotes from './page_votes/index.vue'
import pageFollowing from './page_following/index.vue'
import pageFollowers from './page_followers/index.vue'

export default {
  name: 'pageApp__user',
  components: {
    pageHeader,
    pageNodes,
    pageJoints,
    pageVotes,
    pageFollowers,
    pageFollowing,
  },
  data () {
    return {
      user: null,
      // pageId: 'nodes',
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
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
