<template lang="pug">
  kalpa-layout()
    template(v-slot:body)
      //- nav header
      .row.full-width.items-start.content-start.justify-center
        // nav header
        div(v-if="false" :style=`{ height: '60px', borderRadius: '10px'}`).row.full-width.items-center.content-center.q-pa-sm.b-40
          q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()")
          .col.full-height
            .row.fit.items-center.content-center.justify-center
              span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('essences')}}
          q-btn(round flat color="white" icon="more_vert")
        //q-spinner-dots(v-if="!node" color="green" size="60px").fixed-center
        div(v-if="node" :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          q-dialog(
            v-model="itemEditorShow"
            :maximized="false"
            position="standard")
            item-editor(
              :item="newNode"
              :publish="true"
              @close="node = $event ? $event : node, itemEditorShow=false")
          // образ
          div(:style=`{width: $store.state.ui.pageWidth + 'px', position: 'relative'}`).row-full-width
            q-resize-observer(@resize="bottomHeight = $q.screen.height - $event.height")
            page-images(:node="node" :isActive="isActive" :maxHeight="imagesMaxHeight" @node="node=$event")
          // fullpage (description / coments / other essences)
          transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
            div(
              v-if="pageId"
              :style=`{
                position: 'relative',
                borderRadius: '20px 20px 0 0',
                height: bottomHeight + 'px',
              }`).row.full-width.b-30
              component(:is="'page-' + pageId" :node="node" :height="bottomHeight" @close="pageId=null" @itemEditorShow="isActive=!$event")
          // author + essence + spheres
          div(v-if="!pageId").row.full-width.q-mt-sm
            q-resize-observer(@resize="imagesMaxHeight = $q.screen.height - $event.height")
            .row.full-width.justify-end
              div(v-if="sameCompositionNodes.length > 1" @click="pageId='essences'").row.cursor-pointer
                small.text-green-10.text-bold.q-pr-xs.q-mt-xs  {{sameCompositionNodes.length}}
                small.text-grey-7.text-weight-thin.q-mt-xs  {{$getNoun(sameCompositionNodes.length, $t('смысл'), $t('смысла'), $t('смыслов'))}} {{$t('на этот образ')}}
                //small(v-if="node.items[0].layers[0].contentName").text-grey-7.text-weight-bolder.text-italic.q-pl-xs.q-mt-xs {{node.items[0].layers[0].contentName.substring(0, 22)}}{{node.items[0].layers[0].contentName.length > 22 ? '...': ''}}
              small(v-else @click="itemEditorShow=true").cursor-pointer.text-green-10.text-weight-thin.q-mt-xs  {{$t('Добавить смысл на этот образ')}}
            // список других сутей
            q-tab-panels(
              v-model="currentIndx"
              :swipeable="true || $q.platform.is.mobile"
              :animated="true || $q.platform.is.mobile"
              dark
              :style=`{borderRadius: '10px', border: '1px solid rgb(40,40,40)', overflow: 'hidden'}`).full-width
              q-tab-panel(v-for="(n,ix) in sameCompositionNodes"
                :key="ix" :name="ix").full-width.q-pa-none
                page-essence(:oid="n.oid" @description="pageId='description'" @essences="pageId='essences'" @comments="pageId='comments'")
                  template(v-slot:left)
                    q-btn(:disable="!itemsLeft.length" dense flat icon="chevron_left" :color="itemsLeft.length ? 'grey-5':'grey-9'" :style=`{zIndex: '100', borderRadius: '0px 50% 50% 0px'}` @click="currentIndx--")
                  template(v-slot:right)
                    q-btn(:disable="!itemsRight.length" dense flat icon="chevron_right" :color="itemsRight.length ? 'grey-5':'grey-9'" :style=`{zIndex: '100', borderRadius: '50% 0px 0px 50%'}` @click="currentIndx++")
                  //template(v-slot:badge)
                  //  span(v-if="sameCompositionNodes.length > 1") {{sameCompositionNodes.length}}

          //// comments
          //div(v-if="!pageId" @click="pageId='comments'" ).cursor-pointer.row.full-width.items-center.q-py-md
          //  //q-separator(dark).full-width.q-mt-md
          //  span.text-grey.q-pl-sm {{$t('Comments')}} ● {{node.countStat.countComments}}
          //  .col.scroll.q-px-md
          //    div(v-if="node.commentStat.topComment").row.full-width.items-center.content-center.no-wrap
          //      span.text-grey.text-weight-thin.text-italic.q-pr-md {{node.commentStat.topComment.text}}
          //      q-btn(v-for="(c,id) in node.commentStat.randomComments" :key="id"
          //        :to="'/user/'+c.author.oid" size="sm" round flat color="grey" no-caps padding="none"
          //        :style=`{ whiteSpace: 'nowrap' }`).q-pl-xs
          //        q-avatar(:size="'20px'")
          //          img(:src="c.author.thumbUrl" :to="'/user/'+c.author.oid")
          //        // span() {{c.author.name}}
          //  q-btn(round flat dense :icon="pageId ? 'expand_less' : 'expand_more'" color="white" @click="pageId='comments'")
          //  //q-separator(dark).full-width.q-mt-md

          // похожие
          //div(:style=`{height: '1px', background: 'rgb(40,40,40)'}`).full-width
          .row.full-width.q-pt-lg
            .row.full-width.justify-end
              small.text-grey-8 {{$t('Ядра, связанные с этим смыслом')}}
            //small.text-grey.text-center.text-italic.q-px-xs "{{node.name.substring(0, 22)}}{{node.name.length>22 ? '...': ''}}"
            page-similar(v-if="!pageId" :node="node")
</template>

<script>

import { RxCollectionEnum } from 'src/system/rxdb'
import itemEditor from 'src/components/kalpa_item/item_editor'
import pageSimilar from './page_similar/index.vue'
import pageComments from './page_comments/index.vue'
import pageDescription from './page_description/index.vue'
import pageEssences from './page_essences/index.vue'
import pageEssence from './page_essence/index.vue'
import pageImages from './page_images/index.vue'
import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'pageApp_node2',
  components: {
    pageSimilar,
    pageComments,
    pageDescription,
    pageEssences,
    pageEssence,
    pageImages,
    itemEditor
  },
  data () {
    return {
      node: null,
      compositionOid: null,
      itemEditorShow: false,
      pageId: null,
      bottomHeight: 0,
      imagesMaxHeight: 0,
      isActive: true,
      sameCompositionNodesItemsRes: null, // ядра с тем же образом
      currentIndx: -1 // индекс текущего ядра в sameCompositionNodesItemsRes.items
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to && (!this.node || this.node.oid !== to)) {
          // this.$log('$route.params.oid TO', to)
          this.node = null
          this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
    sameCompositionNodes: {
      handler (to, from) {
        // this.$log('sameCompositionNodes to', cloneDeep(to))
        if (to) {
          this.currentIndx = to.findIndex(item => item.oid === this.node.oid)
        } else this.currentIndx = -1
      }
    },
    compositionOid: { // изменилась композиция
      async handler (to, from) {
        // this.$log('compositionOid to=', to)
        this.sameCompositionNodesItemsRes = null
        if (to) {
          let itemsRes = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
              objectTypeEnum: { $in: ['NODE'] },
              oidSphere: to,
              sortStrategy: 'ESSENTIALLY' // 'ACTIVITY', // AGE
            },
            populateObjects: false
          })
          // за время выполнения запроса compositionOid могло поменяться (не делаем лишних присваиваний иначе currentIndx === -1 и суть промаргивает)
          if (this.compositionOid === to) this.sameCompositionNodesItemsRes = itemsRes
        }
      }
    },
    async node (to, from) {
      // this.$log('node to=', to?.oid)
      this.pageId = null
      this.isActive = true
      this.compositionOid = to?.items[0].oid
      if (to && this.sameCompositionNodes) {
        this.currentIndx = this.sameCompositionNodes.findIndex(item => item.oid === to.oid)
      } else this.currentIndx = -1
      if (to && this.$route.params.oid !== to.oid) await this.$router.replace({ params: { oid: to.oid } })
    },
    async currentIndx (to) {
      // this.$log('currentIndx to', to)
      if (to >= 0) {
        this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, this.sameCompositionNodes[to].oid)
      }
    }
  },
  computed: {
    newNode () {
      // this.$log('resetNewNode ')
      let node = cloneDeep(this.node)
      node.name = ''
      node.description = ''
      // node.spheres = []
      return node
    },
    fontSize () {
      let l = this.node.name.length
      if (l < 20) return 22
      else if (l < 30) return 20
      else if (l < 40) return 16
      else return 14
    },
    itemsRight () {
      if (this.currentIndx >= 0) return this.sameCompositionNodes.slice(this.currentIndx + 1, this.sameCompositionNodes.length)
      return []
    },
    itemsLeft () {
      if (this.currentIndx >= 0) return this.sameCompositionNodes.slice(0, this.currentIndx)
      return []
    },
    sameCompositionNodes () {
      // this.$log('sameCompositionNodes calc', this?.node?.oid, cloneDeep(this?.sameCompositionNodesItemsRes?.items))
      if (this.sameCompositionNodesItemsRes && this.node) {
        let indxCurrent = this.sameCompositionNodesItemsRes.items.findIndex(item => item.oid === this.node.oid)
        this.$log('sameCompositionNodes calc2', indxCurrent)
        if (indxCurrent === -1) return [this.node, ...this.sameCompositionNodesItemsRes.items]
        else return this.sameCompositionNodesItemsRes.items
      } else if (this.node) return [this.node]
      else return []
      // return this?.sameCompositionNodesItemsRes?.items?.length ? this.sameCompositionNodesItemsRes.items : this.node ? [this.node] : []
    },
    length () {
      return this.sameCompositionNodes.length
    }
  },
  methods: {},
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
