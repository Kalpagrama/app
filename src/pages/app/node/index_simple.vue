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
          h1.text-white.text-bold {{$t('Node')}}
          .col
          //- tutorial
          //q-btn(
          //  @click=""
          //  round flat color="white" icon="fas fa-info")
          q-btn(
            @click=""
            round flat color="white" icon="fas fa-info")
      //- body
      div(
        v-if="node"
        :style=`{
          //- paddingTop: '8px',
        }`).row.full-width.justify-center.b-30
          div(
            v-if="node"
            :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-pb-xs
            //- node wrapper
            div(
              v-intersection=`{
                handler: $throttle(nodeVisibilityCallback, 150)
              }`
              ).row.full-width
              item-feed(
                :itemShortOrFull="node"
                :itemState="{}"
                :isActive="nodeIsVisible"
                :isVisible="nodeIsVisible")
            .row.full-width.q-pt-lg.q-px-xs
              q-list(bordered).row.full-width
                q-expansion-item(group="somegroup" icon="chat" :label="$t('Comments')" dark).col-12
                  // template(v-slot:header)
                    // todo самый лучший коммент
                  row.full-width
                    page-comments(:item="node")
                q-separator
                q-expansion-item(group="somegroup" icon="grid_view" :label="$t('Similar')" dark default-opened=false).col-12
                  page-similar(:node="node")
                q-separator
              //page-joints(
              //  :node="node"
              //  :height="700"
              //)

</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import navMobile from './nav_mobile.vue'
import widgetJoints from './widget_joints/index.vue'
import pageJoints from './page_joints/index.vue'
import pageSimilar from './page_similar/index.vue'
import pageComments from './page_comments/index.vue'
import { assert } from 'src/system/common/utils'

export default {
  name: 'pageApp_node',
  components: {
    navMobile,
    widgetJoints,
    pageJoints,
    pageComments,
    pageSimilar,
  },
  data () {
    return {
      node: null,
      nodeIsVisible: true,
      pageId: 'graph',
      pages: [{id: 'graph', name: this.$t('Graph')}, {id: 'joints', name: this.$t('Joints')}, {id: 'comments', name: this.$t('Comments')}]
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
    pageId: {
      // immediate: true,
      handler (to, from) {
        if (this.$route.query.pageId !== to) this.$router.replace({ path: this.$route.path, query: {...this.$route.query, pageId: to }})
      }
    },
    '$route.query.pageId': {
      immediate: true,
      handler (to, from) {
        this.pageId = to || this.pageId
      }
    }
  },
  methods: {
    nodeVisibilityCallback (entry) {
      let isVisible = !!entry.isIntersecting
      this.$log('nodeVisibilityCallback', isVisible)
      this.nodeIsVisible = isVisible
    }
  },
  async mounted () {
    this.$log('mounted', this.node)
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
