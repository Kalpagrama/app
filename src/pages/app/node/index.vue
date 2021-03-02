<template lang="pug">
q-layout(
  view="hHh Lpr lff").b-30
  q-header(reveal)
    .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-pa-md.b-30
        q-icon(name="adjust" color="white" size="30px").q-mr-sm
        h1.text-white.text-bold Ядро
  q-footer(reveal)
    nav-mobile(
      :pageId="pageId"
      @pageId="pageIdChange")
  q-page-container
    q-page(
      :style=`{
        paddingTop: '8px',
        paddingBottom: '200px',
      }`)
      .row.full-width.justify-center.b-30
        div(
          v-if="node"
          :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-pb-xs
          //- node wrapper
          div(
            v-observe-visibility=`{
              throttle: 150,
              callback: nodeVisibilityCallback,
              intersection: {
                //- root: scrollTargetIsWindow ? null : scrollTarget,
                //- rootMargin: '-50% 0px'
              }
            }`
            ).row.full-width.q-px-sm
            node-feed(
              :node="node"
              :isActive="nodeIsVisible"
              :isVisible="nodeIsVisible")
          .row.full-width.q-pt-lg.q-px-xs
            page-joints(:node="node")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import navMobile from './nav_mobile.vue'
import pageJoints from './page_joints/index.vue'

export default {
  name: 'pageApp_node',
  components: {
    navMobile,
    pageJoints,
  },
  data () {
    return {
      node: null,
      nodeIsVisible: true,
    }
  },
  computed: {
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          // this.$log('$route.params.oid TO', to)
          this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
  methods: {
    nodeVisibilityCallback (isVisible, entry) {
      this.$log('nodeVisibilityCallback')
      this.nodeIsVisible = isVisible
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
  }
}
</script>
