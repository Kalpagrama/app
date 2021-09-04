<template lang="pug">
  kalpa-layout
    template(v-slot:footer)
      kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
    template(v-slot:body)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          tab-list-feed(
            v-if="sphere"
            :scrollAreaHeight="scrollAreaHeight || $q.screen.height"
            searchInputState="disabled"
            :pages="pages"
            :pageId="pageId"
            :query="query"
            nextSize=11
            :itemMiddlePersist="true"
            screenSize=36
            @searchString="searchString = $event"
            @pageId="pageId = $event"
          ).row.full-width
            template(v-slot:externalHeader)
              page-header(v-if="sphere" :sphere="sphere").q-mb-sm
            template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
              item-feed(
                :item="item.populatedObject"
                :isActive="isActive"
                :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import pageHeader from './page_header.vue'

export default {
  name: 'pageApp__sphere',
  components: {
    pageHeader,
  },
  data () {
    return {
      sphere: null,
      pageId: 'all',
    }
  },
  computed: {
    pages () {
      return [
        {id: 'all', name: this.$t('All')},
        {id: 'contents', name: this.$t('Media')},
        {id: 'nodes', name: this.$t('Nodes')},
        {id: 'joints', name: this.$t('Joints')},
        {id: 'blocks', name: this.$t('Blocks')},
        {id: 'spheres', name: this.$t('Spheres')},
        {id: 'users', name: this.$t('Users')}
      ]
    },
    query () {
      let objectTypes
      if (this.pageId === 'all') {
        objectTypes = ['VIDEO', 'IMAGE', 'BOOK', 'NODE', 'BLOCK', 'USER', 'JOINT', 'WORD', 'SENTENCE', 'CHAR']
      } else if (this.pageId === 'nodes') {
        objectTypes = ['NODE']
      } else if (this.pageId === 'joints') {
        objectTypes = ['JOINT']
      } else if (this.pageId === 'blocks') {
        objectTypes = ['BLOCK']
      } else if (this.pageId === 'contents') {
        objectTypes = ['VIDEO', 'IMAGE', 'BOOK']
      } else if (this.pageId === 'users') {
        objectTypes = ['USER']
      } else if (this.pageId === 'spheres') {
        objectTypes = ['WORD', 'SENTENCE', 'CHAR']
      } else throw new Error('bad pageId: ' + this.pageId)

      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          oidSphere: this.sphere.oid,
          objectTypeEnum: { $in: objectTypes },
          // querySearch: this.searchString,
          sortStrategy: 'ACTIVITY' // 'ACTIVITY', // AGE
        },
        populateObjects: true,
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
