<template lang="pug">
kalpa-layout()
  template(v-slot:footer)
    nav-mobile(
      :pageId="pageId"
      @pageId="pageIdChange")
  template(v-slot:body)
    .row.full-width.items-start.content-start
      //- header
      .row.full-width.justify-center.b-30
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-pa-md
          q-icon(name="adjust" color="white" size="30px").q-mr-sm
          h1.text-white.text-bold {{$t('Node')}}
      //- body
      div(
        :style=`{
          //- paddingTop: '8px',
          paddingBottom: '200px',
        }`).row.full-width.justify-center.b-30
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
              //- widget-joints(:node="node")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import navMobile from './nav_mobile.vue'
import widgetJoints from './widget_joints/index.vue'
import pageJoints from './page_joints/index.vue'

export default {
  name: 'pageApp_node',
  components: {
    navMobile,
    widgetJoints,
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
      this.$log('nodeVisibilityCallback', isVisible)
      this.nodeIsVisible = isVisible
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
