<template lang="pug">
  kalpa-layout()
    template(v-slot:body)
      .row.full-width.items-start.content-start
        .row.full-width.justify-center
          div(
            :style=`{
            height: headerHeight + 'px',
            maxWidth: $store.state.ui.pageWidth+'px',
            background: 'rgb(40,40,40)',
            borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.q-pa-sm
            q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()")
            .col
              .row.fit.items-center.content-center.justify-center.q-pa-sm
                span(:style=`{fontSize: '18px',}`).text-white.text-bold {{pageName}}
            //q-btn(round flat color="white" icon="delete" @click="clearData")
        .row.full-width
          component(
            :is="'view-'+pageId"
            :item="item"
            :height="($q.screen.height - headerHeight)"
            @started="pageStarted = true")
</template>

<script>
import viewArticle from './view_article/index.vue'
import viewUpload from './view_upload/index.vue'
import viewBlock from './view_block/index.vue'
import { RxCollectionEnum } from 'src/system/rxdb'
import { WsItemTypeEnum } from 'src/system/rxdb/common'

export default {
  name: 'workspace_pageCreate',
  components: {
    viewArticle,
    viewUpload,
    viewBlock
  },
  data () {
    return {
      pageStarted: false,
      item: null,
      headerHeight: 60
    }
  },
  computed: {
    pageId () {
      switch (this.$route.query.mode) {
        case 'upload':
          return 'upload'
        case 'article':
          return 'article'
        case 'block':
          return 'block'
        default:
          throw new Error('bad mode: ' + this.$route.query.mode)
      }
    },
    pageName () {
      let pageName = this.$t('Create')
      if (this.pageId === 'article') pageName += ' ' + this.$t('article')
      if (this.pageId === 'block') pageName += ' ' + this.$t('essence block')
      return pageName
    }
  },
  methods: {
  },
  async mounted () {
    this.$log('mounted')
    if (this.pageId === 'block') {
      let query = {
        selector: { rxCollectionEnum: RxCollectionEnum.WS_BLOCK, temporary: true },
        sort: [{ createdAt: 'desc' }]
      }
      if (this.$route.query.id) {
        query.selector = {rxCollectionEnum: RxCollectionEnum.WS_BLOCK, id: this.$route.query.id }
      }
      let { items: [existingBlock] } = await this.$rxdb.find(query)
      if (existingBlock) this.item = existingBlock
      else {
        let blockInput = {
          name: '',
          spheres: [],
          category: 'FUN',
          temporary: true,
          graph: { nodes: [], joints: [], selectedItem: null }
        }
        this.item = await this.$rxdb.set(RxCollectionEnum.WS_BLOCK, blockInput)
      }
    }
  }
}
</script>
