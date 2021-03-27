<template lang="pug">
kalpa-layout()
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$q.screen.lt.md")
  template(v-slot:body)
    .row.full-width.items-start.content-start.justify-center
      page-header(v-if="sphere" :sphere="sphere").q-mb-sm
      component(
        v-if="sphere"
        :is="`page-${$route.params.page}`"
        :sphere="sphere"
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import pageHeader from './page_header.vue'

import pageNodes from './page_nodes/index.vue'
import pageJoints from './page_joints/index.vue'
import pageContent from './page_content/index.vue'
import pageSpheres from './page_spheres/index.vue'
import pagePeople from './page_people/index.vue'

export default {
  name: 'pageApp__sphere',
  components: {
    pageHeader,
    pageNodes,
    pageJoints,
    pageContent,
    pageSpheres,
    pagePeople,
  },
  data () {
    return {
      sphere: null,
      pageId: 'nodes',
    }
  },
  computed: {
    tabs () {
      return [
        {id: 'content', name: 'Медиа'},
        {id: 'nodes', name: 'Ядра'},
        {id: 'joints', name: 'Связи'},
        {id: 'people', name: 'Люди'},
        {id: 'spheres', name: 'Сферы'}
      ]
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          // this.$log('$route.params.oid TO', to)
          this.sphere = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
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
