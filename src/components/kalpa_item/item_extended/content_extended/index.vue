<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  q-spinner-dots(v-if="!content" color="green" size="60px").fixed-center
  div(v-else).row.full-width
    // header
    div(v-if="!$q.screen.lt.md").row.full-width.justify-center.b-30
      div(
        :style=`{ borderRadius: '10px'}`).row.full-width.items-center.content-center.q-pa-sm.b-30
        q-btn(@click="$routerKalpa.back()" flat round color="white" icon="west" no-caps)
        .col
        h1.text-white.text-bold {{$t('Контент')}}
        .col
        //- tutorial
        q-btn(
          @click=""
          round flat color="white" icon="fas fa-info" :style=`{opacity:'0'}`)
        //q-btn(
        //  @click="$store.commit('ui/stateSet', ['kalpaTutorial', {id: 'node_first', useIntro: false, useProfileEditor: false}])"
        //  round flat color="white" icon="fas fa-info")
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
      page-similar(:node="state.node")
</template>

<script>

import { RxCollectionEnum } from 'src/system/rxdb'
import pageSimilar from '../page_similar/index.vue'
import pageComments from '../page_comments/index.vue'
import pageDescription from '../page_description/index.vue'
import navMobile from 'src/components/kalpa_menu_mobile/nav_mobile.vue'

import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'contentExtended',
  props: {
    oid: {
      type: String,
      required: true
    },
    showActions: { default: true },
    showAuthor: { default: true },
    showComments: { default: true },
    showEssences: { default: true },
    showSimilar: { default: true }
  },
  components: {
    pageSimilar,
    pageComments,
    navMobile,
    pageDescription,
  },
  data () {
    return {
      content: null,
      pageId: null, // description|comments|essences
      bottomHeight: 0, // сколько места под образом
      imageMaxHeight: 0 // максимальная высота образа
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
  },
  async mounted () {
    this.$log('mounted', this.oid)
    this.content = this.$rxdb.get(RxCollectionEnum.OBJ, this.oid)
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
