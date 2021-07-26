<template lang="pug">
  kalpa-layout()
    template(v-slot:footer)
      nav-mobile(
        v-if="$q.screen.lt.md"
        :pageId="pageId"
        @pageId="pageIdChange")
    template(v-slot:body)
      .row.full-width.items-start.content-start
        //- header
        .row.full-width.justify-center.b-30.q-pa-sm
          div(
            :style=`{
            maxWidth: $store.state.ui.pageWidth+'px',
            borderRadius: '10px',
          }`).row.full-width.items-center.content-center.q-pa-sm.b-40
            q-icon(name="adjust" color="white" size="30px").q-ml-sm
            .col
            h1.text-white.text-bold {{$t('Essence Block')}}
            .col
            //- tutorial
            q-btn(
              @click="$store.commit('ui/stateSet', ['kalpaWelcome', {id: 'node_first', useIntro: false, useProfileEditor: false}])"
              round flat color="white" icon="fas fa-info")
        //- body
        div(
          v-if="node"
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
            ).row.full-width
              node-feed(
                :node="node"
                :isActive="nodeIsVisible"
                :isVisible="nodeIsVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import navMobile from 'src/pages/app/node/nav_mobile.vue'
import pageComments from 'src/pages/app/node/page_comments/index.vue'

export default {
  name: 'viewBlock',
  components: {
    navMobile,
    pageComments,
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
    // '$route.params.oid': {
    //   deep: true,
    //   immediate: true,
    //   async handler (to, from) {
    //     if (to) {
    //       // this.$log('$route.params.oid TO', to)
    //       this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
    //     }
    //   }
    // },
  },
  methods: {
    nodeVisibilityCallback (isVisible, entry) {
      this.$log('nodeVisibilityCallback', isVisible)
      this.nodeIsVisible = isVisible
    }
  },
  async mounted () {
    this.$log('mounted')
    this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, '180444567869458458')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
