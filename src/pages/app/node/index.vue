<template lang="pug">
  kalpa-layout()
    template(v-slot:footer)
      kalpa-menu-mobile(v-if="$q.screen.lt.md || pageId==='images' || pageId==='essences'")
        template(v-if="pageId==='essences' || pageId==='images'" v-slot:all)
          q-btn(v-if="pageId==='essences'" flat ripple=false icon="add" color="green" :label="$t('Добавить свой смысл')" @click="itemEditorShow=true")
          q-btn(v-if="pageId==='images'" flat ripple=false icon="add" color="green" :label="$t('Добавить свой образ')" @click="itemEditorShow=true")
    template(v-slot:body)
      .row.full-width.items-start.content-start.justify-center
        q-spinner-dots(v-if="!state.node" color="green" size="60px").fixed-center
        div(v-if="state.node" :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          q-dialog(
            v-model="itemEditorShow"
            :maximized="false"
            position="standard")
            essence-editor(
              :item="pageId==='images' ? newNodeSameEssence : newNodeSameImage"
              :publish="true"
              @close="setNode($event || node), itemEditorShow=false")
          // образ
          div(:style=`{width: $store.state.ui.pageWidth + 'px', position: 'relative'}`).row-full-width
            q-resize-observer(@resize="bottomHeight = $q.screen.height - $event.height")
            page-image(
              :isActive="state.imageActive"
              :node="state.node"
              :imagesNodes="imagesNodes"
              :imagesNodesIndx="imagesNodesIndx"
              :maxHeight="imageMaxHeight"
              @node="setNode($event)")
              template(v-slot:bottom)
                  div(v-if="essencesNodes.length > 1" @click="pageId='essences'").row.cursor-pointer.q-pa-sm
                    small.text-green-8.text-bold {{essencesNodes.length}}
                    small.text-grey-7.text-weight-thin.q-pl-xs  {{$getNoun(essencesNodes.length, $t('смысл'), $t('смысла'), $t('смыслов'))}} {{$t('на этот образ')}}
                    q-icon(dense name="expand_more" color="grey-5"  size="14px")
                    //small(v-if="state.node.items[0].layers[0].contentName").text-grey-7.text-weight-bolder.text-italic.q-pl-xs.q-mt-xs {{state.node.items[0].layers[0].contentName.substring(0, 22)}}{{state.node.items[0].layers[0].contentName.length > 22 ? '...': ''}}
                  small(v-else @click="itemEditorShow=true").cursor-pointer.text-green-5.text-weight-thin.q-my-xs.q-px-xs  {{$t('Добавить смысл на этот образ')}}
          // fullpage (description / coments / other essences / other images)
          transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
            div(
              v-if="pageId"
              :style=`{
                position: 'relative',
                borderRadius: '20px 20px 0 0',
                height: bottomHeight + 'px',
              }`).row.full-width.b-30
              component(:is="'page-' + pageId"
                :node="state.node"
                :height="bottomHeight"
                :essencesNodes="essencesNodes"
                :imagesNodes="imagesNodes"
                :essencesNodesIndx="essencesNodesIndx"
                :imagesNodesIndx="imagesNodesIndx"
                :newNode="newNodeSameImage"
                @close="pageId=null"
                @set-node="setNode($event)"
                @itemEditorShow="state.imageActive=!$event")
          // author + essence + spheres
          div(v-if="!pageId" :style=`{border: '1px solid rgb(50,50,50)', overflow: 'hidden'}`).row.full-width.q-pt-xs.br-10
            q-resize-observer(@resize="imageMaxHeight = $q.screen.height - $event.height")
            // список других сутей
            q-tab-panels(
              v-model="state.node.oid"
              :swipeable="true || $q.platform.is.mobile"
              :animated="true || $q.platform.is.mobile"
              dark
              :style=`{minHeight: '143px'}`).full-width
              q-tab-panel(v-for="(n,ix) in essencesNodes"
                :key="n.oid" :name="n.oid").full-width.q-pa-none
                transition(appear :enter-active-class="'animated fadeIn'" :leave-active-class="'animated fadeOut'")
                  page-essence(:oid="n.oid"
                    :imagesNodes="imagesNodes"
                    :imagesNodesIndx="imagesNodesIndx"
                    @description-show="pageId='description'"
                    @essences-show="pageId='essences'"
                    @images-show="pageId='images'"
                    @comments-show="pageId='comments'"
                    @set-node="setNode($event)")
                    template(v-slot:actions-left)
                      q-btn(:disable="!essenceLeft.length" dense flat icon="chevron_left" :color="essenceLeft.length ? 'grey-5':'grey-9'" @click="setNode(essencesNodes[ix-1])")
                    template(v-slot:actions-right)
                      q-btn(:disable="!essenceRight.length" dense flat icon="chevron_right" :color="essenceRight.length ? 'grey-5':'grey-9'" @click="setNode(essencesNodes[ix+1])")
                      //template(v-slot:badge)
                      //  span(v-if="essencesNodes.length > 1") {{essencesNodes.length}}
            // список образов + комменты
            widget-images(
              :node="state.node"
              :imagesNodes="imagesNodes"
              :imagesNodesIndx="imagesNodesIndx"
              @set-node="setNode($event)" @images-show="pageId='images'").q-pt-md
            // comments
            .row.full-width.content-end.q-pt-md
              div(@click="pageId='comments'").cursor-pointer.row.full-width.items-center
                // div(:style=`{height: '1px', background: 'rgb(40,40,40)'}`).full-width
                span.text-grey-5.q-px-sm {{$t('Comments')}}
                span.text-grey-8 {{state.node.countStat.countComments}}
                .col
                q-btn(round flat dense :icon="pageId ? 'expand_less' : 'expand_more'" color="grey-5" :style=`{zIndex: '100'}`  @click="pageId='comments'")
                div(v-if="state.node.commentStat.topComment").row.full-width.items-center
                  q-avatar(:size="'25px'" :style=`{position:'relative', overflow: 'hidden'}`).q-mx-xs.q-mb-xs
                    img(:src="state.node.commentStat.topComment.author.thumbUrl" :to="'/user/'+state.node.commentStat.topComment.author.oid")
                    div(:style=`{background: 'rgba(0,0,0,0.4)', zIndex: '50'}`).fit.absolute
                  .col.content-center.q-px-xs
                    small.text-grey.text-weight-thin.text-italic.q-pr-md {{state.node.commentStat.topComment.text.substring(0, 77)}}{{state.node.commentStat.topComment.text.length>77?'...':''}}
          // похожие
          //div(:style=`{height: '1px', background: 'rgb(40,40,40)'}`).full-width
          div(v-if="!pageId").row.full-width.q-pt-lg
            .row.full-width.justify-end
              small.text-grey-8.q-pb-xs.q-px-xs {{$t('похожие ядра')}}
            //small.text-grey.text-center.text-italic.q-px-xs "{{state.node.name.substring(0, 22)}}{{state.node.name.length>22 ? '...': ''}}"
            page-similar(v-if="false && !pageId" :node="state.node")
</template>

<script>

import { RxCollectionEnum } from 'src/system/rxdb'
import pageSimilar from './page_similar/index.vue'
import pageComments from './page_comments/index.vue'
import pageDescription from './page_description/index.vue'
import pageEssences from './page_essences/index.vue'
import pageImages from './page_images/index.vue'
import pageEssence from './page_essence/index.vue'
import pageImage from './page_image/index.vue'
import widgetImages from './widget_images/index.vue'

import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'pageNode',
  components: {
    pageSimilar,
    pageComments,
    pageDescription,
    pageEssences,
    pageImages,
    pageEssence,
    pageImage,
    widgetImages,
  },
  data () {
    return {
      state: {
        node: null,
        imagesNodesRes: null, // ядра с той же сутью(список образов)
        essencesNodesRes: null, // ядра с тем же образом(список сутей)
        imageActive: true // главный образ играется
      },
      itemEditorShow: false,
      pageId: null, // description|comments|essences
      bottomHeight: 0, // сколько места под образом
      imageMaxHeight: 0, // максимальная высота образа
    }
  },
  computed: {
    newNodeSameImage () {
      // this.$log('resetNewNode ')
      assert(this.state.node)
      let node = cloneDeep(this.state.node)
      node.name = ''
      node.description = ''
      // node.spheres = []
      return node
    },
    newNodeSameEssence () {
      // this.$log('resetNewNode ')
      assert(this.state.node)
      let node = cloneDeep(this.state.node)
      node.items = []
      // node.spheres = []
      return node
    },
    essencesNodes () {
      return this.state?.essencesNodesRes?.items || []
      // eslint-disable-next-line no-unreachable
      let res = []
      if (this.state.essencesNodesRes && this.state.node) {
        let itemsCopy = [...this.state.essencesNodesRes.items]
        let indx = itemsCopy.findIndex(item => item.oid === this.state.node.oid)
        if (indx >= 0) itemsCopy.splice(indx, 1, this.state.node) // this.state.node уже заполнено (чтобы не дергался плер (он уже начал его проигрывать, а потом загрузились imagesNodesRes))
        else itemsCopy.unshift(this.state.node) // почему-то в essencesNodesRes не оказалось нашего ядра...
        res = itemsCopy
      } else if (this.state.node) res = [this.state.node]
      this.$log('essencesNodes calc', res)
      return res
    },
    imagesNodes () {
      // this.$log('imagesNodes calc', this.state?.node?.oid, cloneDeep(this?.imagesNodesRes?.items))
      return this.state?.imagesNodesRes?.items || []
      // eslint-disable-next-line no-unreachable
      let res = []
      if (this.state.imagesNodesRes && this.state.node) {
        let itemsCopy = [...this.state.imagesNodesRes.items]
        let indx = itemsCopy.findIndex(item => item.oid === this.state.node.oid)
        if (indx >= 0) itemsCopy.splice(indx, 1, this.state.node) // ядро уже заполнено (чтобы не дергался плер (он уже начал его проигрывать, а потом загрузились imagesNodesRes))
        else itemsCopy.unshift(this.state.node) // почему-то в essencesNodesRes не оказалось нашего ядра...
        res = itemsCopy
      } else if (this.state.node) res = [this.state.node]
      this.$log('imagesNodes calc', res)
      return res
    },
    essenceRight () {
      if (this.essencesNodesIndx >= 0) return this.essencesNodes.slice(this.essencesNodesIndx + 1, this.essencesNodes.length)
      return []
    },
    essenceLeft () {
      if (this.essencesNodesIndx >= 0) return this.essencesNodes.slice(0, this.essencesNodesIndx)
      return []
    },
    essencesNodesIndx(){
      return this.essencesNodes.findIndex(item => item.oid === this.state?.node?.oid)
    },
    imagesNodesIndx(){
      return this.imagesNodes.findIndex(item => item.oid === this.state?.node?.oid)
    },
    compositionOid() {
      return this.state?.node?.items[0].oid || null
    },
    essenceOid(){
      return this.state?.node?.sphereFromName.oid
    }
  },
  watch: {
    '$route.params.oid': {
      immediate: true,
      async handler (to, from) {
        if (to && (!this.state.node || this.state.node.oid !== to)) {
          this.$log('$route.params.oid TO', to)
          await this.setNode({oid: to})
        }
      }
    },
    compositionOid: { // изменилась композиция
      async handler (to, from) {
        this.$log('compositionOid to=', to)
        // this.state.essencesNodesRes = null
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
          if (this.compositionOid === to) this.state.essencesNodesRes = itemsRes
        }
      }
    },
    essenceOid: { // изменилась главная суть
      async handler (to, from) {
        this.$log('essenceOid to=', to)
        // this.state.imagesNodesRes = null
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
          // за время выполнения запроса essenceOid могло поменяться (не делаем лишних присваиваний иначе currentIndx === -1 и суть промаргивает)
          if (this.essenceOid === to) this.state.imagesNodesRes = itemsRes
        }
      }
    },
    'state.node.oid': {
      async handler(to, from) {
        this.$log('node.oid to=', to)
        // this.pageId = null
        this.state.imageActive = true
        if (to && this.$route.params.oid !== to) await this.$router.replace({ params: { oid: to } })
      }
    }
  },
  methods: {
    async setNode(item){
      if (item && item.oid !== this.state?.node?.oid) {
        // this.state.node = null
        this.state.node = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
      }
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
