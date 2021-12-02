<template lang="pug">
kalpa-layout()
  template(v-slot:footer)
    //nav-mobile(
    //  v-if="true || $q.screen.lt.md"
    //  :pageId="pageId"
    //  @pageId="pageIdChange")
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
            v-intersection=`{
              handler: $throttle(nodeVisibilityCallback, 150)
            }`
          ).row.full-width
            composer-block(
              :block="item"
              :height="height"
              )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import navMobile from 'src/pages/app/node/nav_mobile.vue'
import composerBlock from 'src/components/kalpa_item/item_editor/composer_block.vue'
import { assert } from 'src/system/common/utils'

export default {
  name: 'viewBlock',
  props: {
    item: {type: Object, required: true},
    height: {type: Number, required: true}
  },
  components: {
    navMobile,
    composerBlock,
  },
  data () {
    return {
      nodeIsVisible: true,
    }
  },
  computed: {
  },
  methods: {
    nodeVisibilityCallback (entry) {
      let isVisible = !!entry.isIntersecting
      this.$log('nodeVisibilityCallback', isVisible)
      this.nodeIsVisible = isVisible
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
