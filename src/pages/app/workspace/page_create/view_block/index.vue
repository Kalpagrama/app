<template lang="pug">
  kalpa-layout()
    template(v-slot:footer)
      nav-mobile(
        v-if="true || $q.screen.lt.md"
        :pageId="pageId"
        @pageId="pageIdChange")
    template(v-slot:body)
      .row.full-width.items-start.content-start
        //- body
        div(
          v-if="item"
          :style=`{
          //- paddingTop: '8px',
          paddingBottom: '200px',
        }`).row.full-width.justify-center.b-30
          div(
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
              block-edit(
                :block="item"
                :height="height"
                )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import navMobile from 'src/pages/app/node/nav_mobile.vue'
import blockEdit from 'src/components/block/edit/index.vue'

export default {
  name: 'viewBlock',
  props: {
    item: {type: Object, required: true},
    height: {type: Number, required: true}
  },
  components: {
    navMobile,
    blockEdit,
  },
  data () {
    return {
      nodeIsVisible: true,
    }
  },
  computed: {
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
