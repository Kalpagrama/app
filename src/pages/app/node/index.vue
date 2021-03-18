<template lang="pug">
kalpa-layout()
  template(v-slot:footer)
    nav-mobile(
      :pageId="pageId"
      @pageId="pageIdChange")
  template(v-slot:body)
    .row.full-width.items-start.content-start
      //- header
      .row.full-width.justify-center.q-pt-sm.b-30
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-pa-md
          q-icon(name="adjust" color="white" size="30px").q-mr-sm
          h1.text-white.text-bold Ядро
      //- body
      div(
        :style=`{
          paddingTop: '8px',
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
            .row.full-width.q-pt-lg.q-px-xs.bg
              widjet-joints(:node="node")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import navMobile from './nav_mobile.vue'
import widgetJoints from './widget_joints/index.vue'

export default {
  name: 'pageApp_node',
  components: {
    navMobile,
    widgetJoints,
  },
  data () {
    return {
      node: null,
      nodeIsVisible: true,
      pack: null,
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
    const {data} = await this.$axios.get('https://data.jsdelivr.com/v1/package/npm/emojione@4.5.0')
    this.pack = data
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
    function maxProfit (prices) {
      let localMaxProfit = 0;
      for (let i = 0, l = prices.length; i < l; i++) {
        // if not last
        if (i + 1 !== l) {
          // if next price if higher
          if (prices[i] < prices[i + 1]) {
            localMaxProfit += prices[i + 1] - prices[i];
          }
        }
      }

      return localMaxProfit
    }

    const entry = [71, 11, 51, 31, 61, 41]; // 70
    this.$log('entry 70', maxProfit(entry))
    const entry2 = [13, 24, 35, 46, 57]; // 44
    this.$log('entry2 44', maxProfit(entry2))
    const entry3 = [700, 612, 445, 343, 10]; // 0
    this.$log('entry3 0', maxProfit(entry3))
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
  }
}
</script>
