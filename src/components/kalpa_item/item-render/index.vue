<template lang="pug">
component(
  v-if="item"
  :is="componentName"
  :item="item"
)
</template>
<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeRender from './node_render.vue'
import jointRender from './joint_render.vue'
import blockRender from './block_render.vue'
import sphereRender from './sphere_render.vue'
import userRender from './user_render.vue'
import contentRender from './content_render.vue'
export default {
  name: 'itemRender',
  components: {
    nodeRender,
    jointRender,
    blockRender,
    sphereRender,
    userRender,
    contentRender,
  },
  data () {
    return {
      item: null,
    }
  },
  computed: {
    componentName() {
      switch (this.item.type) {
        case 'NODE': return 'node-render'
        case 'JOINT': return 'joint-render'
        case 'USER': return 'user-render'
        case 'BLOCK': return 'block-render'
        case 'VIDEO':
        case 'BOOK':
        case 'IMAGE': return 'content-render'
        default: return 'sphere-render'
      }
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          // this.$log('$route.params.oid TO', to)
          this.item = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
  mounted () {
    // alert('mounted!!!!')
    window.itemRenderMounted = true // puppeteer на бэкенде ждет и не рендерит страничку пока эта переменная = false
  },
  destroyed () {
    window.itemRenderMounted = false
  },
  created () {
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
  },
  beforeDestroy () {
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
  }
}
</script>
