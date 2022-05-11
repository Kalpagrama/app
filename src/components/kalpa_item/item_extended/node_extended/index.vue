<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  q-spinner-dots(v-if="!state.node" color="green" size="60px").fixed-center
  div(v-if="state.node").row.full-width
    div(v-if="!$q.screen.lt.md").row.full-width.justify-center.b-30
      div(
        :style=`{ borderRadius: '10px'}`).row.full-width.items-center.content-center.q-pa-sm.b-30
        q-btn(@click="$routerKalpa.back()" flat round color="white" icon="west" no-caps)
        .col
        h1.text-white.text-bold {{$t('Смысловое ядро')}}
        .col
        //- tutorial
        q-btn(
          @click=""
          round flat color="white" icon="more_vert" :style=`{opacity:'100'}`)
        //q-btn(
        //  @click="$store.commit('ui/stateSet', ['kalpaTutorial', {id: 'node_first', useIntro: false, useProfileEditor: false}])"
        //  round flat color="white" icon="fas fa-info")
    q-dialog(
      v-model="itemEditorShow"
      :maximized="false"
      position="standard")
      item-editor(
        :item="pageId==='images' ? newNodeSameEssence : newNodeSameImage"
        :lockName="pageId==='images'"
        :publish="true"
        @close="setNode($event? $event.oid : node.oid), itemEditorShow=false")
    // образ
    //q-btn(v-if="!$q.screen.lt.md" @click="$routerKalpa.back()" flat round color="white" icon="west" no-caps :style=`{position: 'absolute', zIndex: 100}`)
    div(:style=`{position: 'relative'}`).row.full-width
      q-resize-observer(@resize="bottomHeight = $q.screen.height - $event.height")
      page-image(
        :isActive="state.imageActive"
        :node="state.node"
        :imagesNodes="state.imagesNodes"
        :imagesNodesIndx="imagesNodesIndx"
        :maxHeight="imageMaxHeight"
        @set-node="setNode($event.oid, false)")
        template(v-slot:bottom)
          div(v-if="state.essencesNodesInProgress").row.full-width.justify-center
            q-spinner-dots(size="20px" color="green")
          div(v-else-if="true || state.essencesNodes.length > 1").row.full-width.items-center
            //small.text-green-8.text-bold {{state.essencesNodes.length}}
            //small.text-grey-7.text-weight-thin.q-pl-xs  {{$getNoun(state.essencesNodes.length, $t('смысл'), $t('смысла'), $t('смыслов'))}} {{$t('на этот образ')}}
            div(@click="pageId=pageId==='essences'? null : 'essences'").row.cursor-pointer
              small.text-grey-7.text-weight-thin.q-pl-xs {{$t('все смыслы')}}
              q-icon(dense name="expand_more" color="grey-5"  size="14px")
            .col
            q-pagination(v-model="state.essencesNodesIndxPage"
              dark flat dense active-color="green-9" color="grey-5" padding="0px"
              :max="state.essencesNodes.length" :max-pages="7"
              size="9px"
              boundary-numbers)
            .col
            q-icon(v-show="pageId!=='images'"
              dense name="add" color="green-9" size="sm"
              @click="$store.getters.isGuest ? $store.commit('ui/stateSet', ['authGuard', {message: 'Чтобы добавить смысл авторизуйтесь'}]) : itemEditorShow = true"
            ).cursor-pointer.q-pr-xs
              q-tooltip {{$t('Добавить смысл на этот образ')}}
            //small(v-if="state.node.items[0].layers[0].contentName").text-grey-7.text-weight-bolder.text-italic.q-pl-xs.q-mt-xs {{state.node.items[0].layers[0].contentName.substring(0, 22)}}{{state.node.items[0].layers[0].contentName.length > 22 ? '...': ''}}
          div(v-else @click="$store.getters.isGuest ? $store.commit('ui/stateSet', ['authGuard', {message: 'Чтобы добавить смысл авторизуйтесь'}]) : itemEditorShow=true").row.full-width.cursor-pointer.items-center
            small.text-grey-7.text-weight-thin.q-pl-xs  {{$t('Добавить смысл на этот образ')}}
            .col
            q-icon(dense name="add" color="green-9" size="sm").q-pr-xs

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
          :item="state.node"
          :height="bottomHeight"
          :essencesNodes="state.essencesNodes"
          :imagesNodes="state.imagesNodes"
          :essencesNodesIndx="essencesNodesIndx"
          :imagesNodesIndx="imagesNodesIndx"
          :newNode="newNodeSameImage"
          @close="pageId=null"
          @set-node="setNode($event.oid, pageId === 'images' ? false : true)"
          @itemEditorShow="state.imageActive=!$event")
    // author + essence + spheres + comments + images
    div(v-if="!pageId" :style=`{border: '1px solid rgb(50,50,50)', overflow: 'hidden'}`).row.full-width.q-mt-md.br-10
      q-resize-observer(@resize="imageMaxHeight = $q.screen.height - $event.height")
      // пока идет переключение - показывать state.node, иначе - q-tab-panels со всеми смыслами
      div(:style=`{minHeight: '0px'}`).row.full-width.content-start
        page-essence(v-if="state.essencesNodesIndx === -1"
          :oid="state.node.oid"
          :imagesNodes="state.imagesNodes"
          :imagesNodesIndx="imagesNodesIndx"
          :showActions="showActions"
          :showAuthor="showAuthor"
          @description-show="pageId='description'"
          @essences-show="pageId='essences'"
          @images-show="pageId='images'"
          @comments-show="pageId='comments'"
          @set-node="setNode($event.oid, true)").b-30
        q-tab-panels(v-else
        v-model="state.essencesNodesIndx"
          :swipeable="true || $q.platform.is.mobile"
          :animated="true || $q.platform.is.mobile"
          dark).full-width
          q-tab-panel(v-for="(n,ix) in state.essencesNodes" :key="ix" :name="ix").full-width.q-pa-none
            page-essence(:oid="n.oid"
              :imagesNodes="state.imagesNodes"
              :imagesNodesIndx="imagesNodesIndx"
              :showActions="showActions"
              :showAuthor="showAuthor"
              @description-show="pageId='description'"
              @essences-show="pageId='essences'"
              @images-show="pageId='images'"
              @comments-show="pageId='comments'"
              @set-node="setNode($event.oid, true)").b-30
              template(v-slot:actions-left)
                //q-btn(:disable="!essenceLeft.length" dense flat icon="chevron_left" :color="essenceLeft.length ? 'grey-5':'grey-9'" @click="state.essencesNodesIndx = ix-1")
              template(v-slot:actions-right)
                //q-btn(:disable="!essenceRight.length" dense flat icon="chevron_right" :color="essenceRight.length ? 'grey-5':'grey-9'" @click="state.essencesNodesIndx = ix+1")
      // comments
      div(v-if="showComments").row.full-width.content-end.q-pt-md
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
      // список образов
      widget-images(v-if="showImages"
        :node="state.node"
        :imagesNodes="state.imagesNodes"
        :imagesNodesInProgress="state.imagesNodesInProgress"
        :imagesNodesIndx="imagesNodesIndx"
        @set-node="setNode($event.oid, false)" @images-show="pageId='images'").q-pt-md.b-30
    // похожие
    div(v-if="!pageId && showSimilar").row.full-width.q-pt-lg
      .row.full-width.justify-start
        small.text-grey-8.q-pb-xs.q-px-xs {{$t('похожие ядра')}}
      //small.text-grey.text-center.text-italic.q-px-xs "{{state.node.name.substring(0, 22)}}{{state.node.name.length>22 ? '...': ''}}"
      page-similar(:item="state.node")
</template>

<script>

import { RxCollectionEnum } from 'src/system/rxdb'
import pageSimilar from 'src/components/kalpa_item/item_extended/page_similar'
import pageComments from '../page_comments/index.vue'
import pageDescription from '../page_description/index.vue'
import pageEssences from './page_essences/index.vue'
import pageImages from './page_images/index.vue'
import pageEssence from './page_essence/index.vue'
import pageImage from './page_image/index.vue'
import navMobile from 'src/components/kalpa_menu_mobile/nav_mobile.vue'
import widgetImages from './widget_images/index.vue'

import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'nodeExtended',
  props: {
    oid: {
      type: String,
      required: true
    },
    showActions: { default: true },
    showAuthor: { default: true },
    showComments: { default: true },
    showImages: { default: true },
    showSimilar: { default: true }
  },
  emits: ['oid', 'pageId'],
  components: {
    pageSimilar,
    pageComments,
    navMobile,
    pageDescription,
    pageEssences,
    pageImages,
    pageEssence,
    pageImage,
    widgetImages
  },
  data () {
    return {
      state: {
        node: null,
        essenceOid: null, // oid смысла обычно === node.sphereFromName.oid (либо = одной из сфер)
        imagesNodesRes: null,
        imagesNodes: [], // ядра с той же сутью(список образов)
        imagesNodesInProgress: false,
        essencesNodesRes: null,
        essencesNodes: [], // ядра с тем же образом(список сутей)
        essencesNodesInProgress: false,
        essencesNodesIndx: -1,
        essencesNodesIndxPage: -1,
        imageActive: true // главный образ играется
      },
      itemEditorShow: false,
      pageId: null, // description|comments|essences
      bottomHeight: 0, // сколько места под образом
      imageMaxHeight: 0 // максимальная высота образа
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
    essenceRight () {
      if (this.essencesNodesIndx >= 0) return this.state.essencesNodes.slice(this.essencesNodesIndx + 1, this.state.essencesNodes.length)
      return []
    },
    essenceLeft () {
      if (this.essencesNodesIndx >= 0) return this.state.essencesNodes.slice(0, this.essencesNodesIndx)
      return []
    },
    essencesNodesIndx () {
      return this.state.essencesNodes.findIndex(item => item.oid === this.state?.node?.oid)
    },
    imagesNodesIndx () {
      return this.state.imagesNodes.findIndex(item => item.oid === this.state?.node?.oid)
    },
    compositionOid () {
      return this.state?.node?.items[0].oid || null
    },
    essenceOid () {
      return this.state?.node?.sphereFromName.oid
    }
  },
  watch: {
    itemEditorShow (to) {
      if (to) this.state.imageActive = false
      else this.state.imageActive = true
    },
    'state.essencesNodesIndx': {
      handler (to, from) {
        // this.$log('state.essencesNodesIndx TO', to)
        if (to >= 0) {
          assert(this.state.essencesNodes[to])
          this.setNode(this.state.essencesNodes[to].oid, true)
        }
      }
    },
    'state.essencesNodesIndxPage': {
      handler (to, from) {
        if (to >= 1) {
          assert(this.state.essencesNodes[to - 1])
          this.setNode(this.state.essencesNodes[to - 1].oid, true)
        }
      }
    },
    essencesNodesIndx (to, from) {
      this.state.essencesNodesIndx = to
      this.state.essencesNodesIndxPage = to + 1
    },
    'state.imagesNodesRes.items': {
      deep: true,
      handler (to, from) {
        if (to) {
          // this.$log('imagesNodesRes changed', this.state?.node?.oid, cloneDeep(itemsRes.items))
          let res = [...to]
          if (!res.find(item => item.oid === this.state.node.oid)) res = [this.state.node, ...res]
          let indx = res.findIndex(item => item.oid === this.state.node.oid)
          assert(indx >= 0)
          res.splice(indx, 1, this.state.node) // ядро уже заполнено (чтобы не дергался плер (он уже начал его проигрывать, а потом загрузились imagesNodesRes))
          this.state.imagesNodes.splice(0, this.state.imagesNodes.length, ...res)
          // this.$log('this.state.imagesNodes=', cloneDeep(this.state.imagesNodes))
        }
      }
    },
    'state.essencesNodesRes.items': {
      deep: true,
      handler (to, from) {
        if (to) {
          // this.$log('essenceNodesRes changed', this.state?.node?.oid, cloneDeep(itemsRes.items))
          let res = [...to]
          if (!res.find(item => item.oid === this.state.node.oid)) res = [this.state.node, ...res]
          let indx = res.findIndex(item => item.oid === this.state.node.oid)
          assert(indx >= 0)
          res.splice(indx, 1, this.state.node) // ядро уже заполнено (чтобы не дергался плер (он уже начал его проигрывать, а потом загрузились imagesNodesRes))
          this.state.essencesNodes.splice(0, this.state.essencesNodes.length, ...res)
          // this.$log('this.state.essencesNodes=', cloneDeep(this.state.essencesNodes))
        }
      }
    },
    compositionOid: { // изменилась композиция
      async handler (to, from) {
        // this.$log('compositionOid to=', to)
        // this.state.essencesNodesRes = null
        if (to) {
          // this.state.essencesNodes = [this.state.node] -- не надо. иначе суть дергается при смене образа
          assert(this.state.node)
          this.state.essencesNodesInProgress = true
          this.state.essencesNodesRes = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
              objectTypeEnum: { $in: ['NODE'] },
              oidSphere: to,
              sortStrategy: 'ESSENTIALLY' // 'ACTIVITY', // AGE
            },
            populateObjects: false
          })
          this.state.essencesNodesInProgress = false
        }
      }
    },
    'state.essenceOid': { // изменилась главная суть. ищем образы на эту суть
      async handler (to, from) {
        // this.$log('essenceOid to=', to)
        // this.state.imagesNodesRes = null
        if (to) {
          // this.state.imagesNodes = [this.state.node] -- не надо. иначе образы дергается 2 раза при смене сути
          this.state.imagesNodesInProgress = true
          this.state.imagesNodesRes = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
              objectTypeEnum: { $in: ['NODE'] },
              oidSphere: to,
              name: this.state.node.name, // не  берем ядра, у которых другая главная суть (например, эта суть в сферах)
              sortStrategy: 'ESSENTIALLY' // 'ACTIVITY', // AGE
            },
            populateObjects: false
          })
          this.state.imagesNodesInProgress = false
        }
      }
    },
    'state.node.oid': {
      async handler (to, from) {
        this.$log('node.oid to=', to)
        // this.pageId = null
        this.state.imageActive = true
        if (to) this.$emit('oid', to)
      }
    },
    oid: {
      immediate: true,
      async handler (to, from) {
        await this.setNode(to, true)
      }
    },
    pageId (to) {
      this.$emit('pageId', to)
    }
  },
  methods: {
    async setNode (oid, canChangeMainEssence = true) {
      // this.$log('setNode', canChangeMainEssence, this.state?.node?.oid, oid)
      if (oid && oid !== this.state?.node?.oid) {
        this.state.node = await this.$rxdb.get(RxCollectionEnum.OBJ, oid)
        if (canChangeMainEssence) this.state.essenceOid = this.state.node.sphereFromName.oid
        else {
          // образы на суть необязательно находятся в ядрах с таким же именем, но у них тогда обязательно должна быть такая сфера
          assert(this.state.essenceOid)
          assert(this.state.essenceOid === this.state.node.sphereFromName.oid || this.state.node.spheres.find(s => s.oid === this.state.essenceOid))
        }
      }
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
