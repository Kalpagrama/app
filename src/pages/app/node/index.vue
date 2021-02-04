<template lang="pug">
q-layout(
  view="hHh Lpr lff").b-30
  q-footer(reveal)
    div(
      v-if="pageId"
      :style=`{
        height: pageHeight+'px',
        //- marginBottom: '-10px',
      }`).row.full-width.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '10px 10px 0 0',
        }`
        ).row.full-width.b-40
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
          node-feed(
            :node="node"
            :isActive="true"
            :isVisible="true")
          //- .row.full-width.q-pt-lg
            widget-joints(v-if="node" :node="node")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import navMobile from './nav_mobile.vue'
import widgetJoints from './widget_joints/index.vue'

// import pageInside from './page_inside/index.vue'
// import pageNames from './page_names/index.vue'

export default {
  name: 'pageApp_node',
  components: {
    navMobile,
    widgetJoints,
    // pageInside,
    // pageNames,
  },
  data () {
    return {
      node: null,
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
