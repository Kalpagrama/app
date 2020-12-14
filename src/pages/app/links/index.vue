<template lang="pug">
q-layout(
  view="hHh Lpr lff").b-30
  kalpa-loader(
    v-if="node"
    @items="nodesLoaded"
    :immediate="true"
    :query="nodesQuery" :limit="12" v-slot=`{items, next, nexting}`)
  //- q-page-container
    q-page(
      :style=`{
        paddingTop: '8px',
      }`
      ).row.full-width.justify-center
      div(
        v-if="nodeActive"
        :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        node-feed(
          :node="nodeActive"
          :showItems="false"
          :showHeader="true"
          :showActions="nodeActive.oid"
          :showCategory="nodeActive.oid")
          template(v-slot:footer)
            nodeEditor(
              v-if="nodeNew"
              ref="nodeEditor"
              :node="nodeNew"
              @close="nodeNew = null")
          template(v-slot:items)
            //- items wrapper
            div(:style=`{paddingTop: '80px',paddingBottom: '0px',}`).row.full-width.q-px-sm
              //- leftItem
              .col-6
                node-item(
                  :item="leftItem"
                  :itemActive="true"
                  :itemVertice="'ASSOCIATIVE'"
                  :itemIndex="0")
                  template(v-slot:default)
                    //- center
                    div(:style=`{position: 'absolute', zIndex: 210, left: '0px', top: '60px', height: 'calc(100% - 120px)',}`).row
                      //- change leftItem => rightItem
                      q-btn(
                        v-if="!nodeNew && stepIndex !== 0"
                        flat color="white" icon="west"
                        ).fit
              //- rightItem
              .col-6
                node-item(
                  :item="nodeActive.items[1]"
                  :itemActive="true"
                  :itemIndex="1"
                  :itemVertice="'ASSOCIATIVE'")
                  template(v-slot:default)
                    //- add btn
                    q-btn(
                      v-if="nodeNew && !nodeNew.items[1]"
                      @click="$refs.nodeEditor.itemFinderStart()"
                      flat color="green" icon="add" size="xl"
                      ).fit.b-50
                    q-btn(
                      v-if="!nodeNew && nodeActive && !nodeActive.items[1]"
                      @click="nodeNewCreate()"
                      flat color="green" icon="add" size="xl"
                      ).fit.b-50
                    //- item editor
                    div(
                      v-if="nodeNew && nodeNew.items[1]"
                      :style=`{position: 'relative',}`).row.fit
                      item-editor(
                        :isActive="true"
                        :item="nodeNew.items[1]"
                        @item="itemFound($event, 1)"
                        :styles=`{
                          height: '100%',
                        }`
                        :style=`{
                          position: 'absolute', zIndex: 200,
                          height: '100%',
                        }`)
                    //- top
                    div(:style=`{position: 'absolute', zIndex: 210, right: '0px', top: '-4px'}`).row
                      div(:style=`{position: 'absolute', zIndex: 210, right: '0px', bottom: '0px'}`).row
                        //- rightItem PREV
                        div(
                          v-if="!nodeNew && rightItemPrevExists"
                          :style=`{
                            position: 'relative',
                          }`).row.full-width
                          q-btn(
                            @click="nodeActiveIndex -= 1"
                            flat color="white" icon="north"
                            :style=`{
                              position: 'absolute', zIndex: 100,
                              background: 'rgba(0,0,0,0.8)'}`
                            ).fit
                          img(
                            @click="nodeActiveIndex -= 1"
                            :src="leftItem.thumbUrl"
                            :style=`{
                              height: '60px',
                              borderRadius: '10px',
                            }`).cursor-pointer
                    //- center
                    div(:style=`{position: 'absolute', zIndex: 210, right: '0px', top: '60px', height: 'calc(100% - 120px)',}`).row
                      //- change rightItem => leftItem
                      q-btn(
                        v-if="!nodeNew && nodeActive.items[1]"
                        flat color="white" icon="east"
                        :style=`{
                          background: 'rgba(0,0,0,0.1)'
                        }`
                        ).fit
                    //- bottom
                    div(:style=`{position: 'absolute', zIndex: 2000, right: '0px', bottom: '-4px'}`).row
                      div(:style=`{position: 'absolute', zIndex: 2000, right: '0px', top: '0px'}`).row.justify-end
                        //- rightItem NEXT
                        div(
                          v-if="!nodeNew && rightItemNextExists"
                          :style=`{
                            position: 'relative',
                          }`).row.full-width
                          q-btn(
                            @click="nodeActiveIndex += 1"
                            flat color="white" icon="south"
                            :style=`{
                              position: 'absolute', zIndex: 100,
                              background: 'rgba(0,0,0,0.8)'}`
                            ).fit
                          img(
                            :src="nodes[nodeActiveIndex + 1].thumbUrl"
                            :style=`{
                              height: '60px',
                              borderRadius: '10px',
                            }`)
                        q-btn(
                          v-if="!nodeNew && nodeActive.items[1]"
                          @click="nodeNewCreate()"
                          flat color="green" icon="add"
                          :style=`{
                            zIndex: 2000,
                            width: '60px',
                            height: '60px',
                          }`
                          ).b-40.q-mt-xs
      //- .row.full-width.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          //- .row.full-width
            small.text-white {{ node }}
          //- .row.full-width
            small.text-white {{ nodeNew }}
          //- graph
          div(v-if="nodes.length > 0").row.full-width.items-start.content-start
            div(
              v-for="(item, itemii) in nodes" :key="item.oid"
              :style=`{
                height: '60px',
              }`
              ).row.full-width.text-white {{ item.oid }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_links',
  components: {
    kalpaFinder: () => import('components/kalpa_finder/index.vue'),
    nodeItem: () => import('components/node_feed/node_items_item.vue'),
    // nodeEditor: () => import('pages/app/content/explorer_video/view_mobile_new/node_editor/index.vue'),
    // itemEditor: () => import('pages/app/content/explorer_video/view_mobile_new/node_editor/item_editor.vue')
  },
  data () {
    return {
      node: null,
      nodeActiveIndex: null,
      nodeNew: null,
      nodeNewTemplate: {
        oid: null,
        name: '',
        items: [],
        layout: 'VERTICAL',
        vertices: [],
        spheres: [],
        category: 'FUN',
        author: {
          oid: '',
          name: '',
          thumbUrl: '',
        },
        rateStat: []
      },
      nodes: [],
      itemFinderShow: false,
      stepIndex: 0,
      steps: []
    }
  },
  computed: {
    nodeActive () {
      if (this.nodes[this.nodeActiveIndex]) return this.nodes[this.nodeActiveIndex]
      else {
        let nodeTemp = JSON.parse(JSON.stringify(this.nodeNewTemplate))
        nodeTemp.items[0] = this.node
        return nodeTemp
        // return this.nodeNew
      }
    },
    rightItemPrevExists () {
      return this.nodes[this.nodeActiveIndex - 1] ? true : false
    },
    rightItemNextExists () {
      return (this.nodes[this.nodeActiveIndex + 1] && this.nodes.length > 1) ? true : false
    },
    leftItem () {
      if (!this.node) return null
      if (this.node.items[1]) {
        return this.node.items[0]
      }
      else {
        return this.node
      }
    },
    nodesQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'JOINT'] },
          oidSphere: this.leftItem.oid,
          sortStrategy: 'AGE',
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
        this.$log('$route.params.oid TO', to)
        if (to) {
          this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
  methods: {
    async nodeNewCreate () {
      this.$log('nodeNewCreate')
      this.nodeActiveIndex = -1
      let nodeNewInput = JSON.parse(JSON.stringify(this.nodeNewTemplate))
      let currentUser = this.$store.getters.currentUser()
      nodeNewInput.items[0] = this.node
      nodeNewInput.vertices = ['ASSOCIATIVE', 'ASSOCIATIVE']
      nodeNewInput.author = {
        oid: currentUser.oid,
        name: currentUser.name,
        thumbUrl: currentUser.thumbUrl,
      }
      this.nodeNew = nodeNewInput
      // await this.$wait(300)
      // this.$refs.nodeEditor.itemFinderStart()
    },
    itemFound (item, itemIndex) {
      this.$log('itemFound', item, itemIndex)
      // nodeNew.items[1] = $event
      this.$set(this.nodeNew.items, itemIndex, item)
    },
    nodesLoaded (nodes) {
      this.$log('nodesLoaded', nodes)
      if (nodes.length === 0) {
      }
      else {
        this.nodeActiveIndex = nodes.findIndex(n => n.items[0].oid === this.leftItem.oid)
        this.$log('nodeActiveIndex', this.nodeActiveIndex)
      }
      this.nodes = nodes
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
