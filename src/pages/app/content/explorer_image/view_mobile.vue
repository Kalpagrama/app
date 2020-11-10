<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-header.b-30
    .row.full-width.justify-center.b-30
      content-player(
        :contentKalpa="contentKalpa"
        :style=`{
        }`)
        template(v-slot:bar)
          q-btn(
            v-if="pageId !== 'node'"
            @click="nodeCreateStart()"
            round color="green" icon="add"
            :style=`{
              position: 'absolute', zIndex: 1000, bottom: '4px',
              left: 'calc(50% - 20px)',
              borderRadius: '50%',
            }`)
  q-page-container
    component(
      v-if="true"
      :is="`page-${pageId}`"
      :node="node"
      :player="player"
      :contentKalpa="contentKalpa"
      :contentBookmark="contentBookmark"
      :style=`{
        paddingTop: '8px',
        paddingBottom: '100px',
      }`
      @bookmark="contentBookmark = $event"
      @nodeCreate="nodeCreate"
      @nodeEdit="nodeEdit"
      @close="pageId = 'nodes', node = null"
      @figures="figures = $event")
      template(v-slot:bottom)
        div(
          :style=`{}`).row.full-width.justify-center
          div(:style=`{maxWidth: 700+'px'}`).row.full-width
            q-btn(round flat dense color="grey-8" icon="keyboard_arrow_left" @click="$router.back()" no-caps).q-mx-md Назад
            .col
              q-tabs(
                v-model="pageId"
                align="justify"
                no-caps active-color="green").full-width.text-grey-8
                q-tab(v-for="v in pages" :key="v.id" :name="v.id" :label="v.name")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import contentPlayer from 'components/content_player/index.vue'

import pageDetails from './page_details/index.vue'
import pageNode from './page_node/index.vue'
import pageNodes from './page_nodes/index.vue'
import pageJoints from './page_joints/index.vue'

export default {
  name: 'contentExplorerImage',
  components: {contentPlayer, pageDetails, pageNode, pageNodes, pageJoints},
  props: ['contentKalpa', 'query'],
  data () {
    return {
      pageId: 'nodes',
      contentBookmark: null,
      node: null,
      figures: [],
    }
  },
  computed: {
    pages () {
      return [
        {id: 'details', icon: 'info', name: 'Детали'},
        {id: 'nodes', icon: 'filter_tilt_shift', name: 'Ядра'},
        {id: 'joints', icon: 'link', name: 'Связи'}
      ]
    }
  },
  watch: {
    query: {
      immediate: true,
      async handler (to, from) {
        this.$log('query TO', to)
        let [bookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.contentKalpa.oid}})
        this.$log('contentBookmark', bookmark)
        if (bookmark) this.contentBookmark = bookmark
      }
    }
  },
  methods: {
    async nodeCreateStart () {
      this.$log('nodeCreateStart')
      let node = await this.nodeCreate()
      this.nodeEdit(node)
    },
    async nodeCreate () {
      this.$log('nodeCreate')
      let nodeInput = {
        name: '',
        spheres: [],
        category: 'FUN',
        layout: 'VERTICAL',
        thumbUrl: this.contentKalpa.thumbUrl,
        items: [
          {
            id: Date.now().toString(),
            thumbUrl: this.contentKalpa.thumbUrl,
            outputType: 'IMAGE',
            layers: [
              {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: null, points: []}, {t: null, points: []}]},
            ],
            operation: { items: null, operations: null, type: 'CONCAT'},
            meta: {cover: false, loop: true}
          }
        ]
      }
      let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeCreate node', node)
      return node
    },
    async nodeEdit (node) {
      this.$log('nodeEdit', node)
      if (this.node === null) {
        this.node = node
      }
      else {
        this.node = null
        await this.$wait(300)
        this.node = node
      }
      this.pageId = 'node'
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
