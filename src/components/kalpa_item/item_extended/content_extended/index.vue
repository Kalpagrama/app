<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  q-resize-observer(@resize="pageWidth = $event.width")
  q-spinner-dots(v-if="!content" color="green" size="60px").fixed-center
  div(v-else).row.full-width
    // header
    div(v-if="!isFullScreen && $screenProps.isMobile").row.full-width.justify-center.b-30
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
    div(:style=`{position: 'relative'}`).row.full-width
      q-resize-observer(@resize="bottomHeight = $q.screen.height - $event.height")
      content-view(:content="content" :style=`{ height: '300px'}`).row.full-width
      q-btn(round flat dense :icon="isFullScreen ? 'fullscreen_exit': 'fullscreen'" color="grey-5" @click="isFullScreen=!isFullScreen")
    div(v-if="!isFullScreen").row.full-width
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
            :item="content"
            :height="bottomHeight"
            @close="pageId=null")
      // description expand btn
      .row.full-width
        .col
        q-btn(v-if="content.description" round flat dense icon="expand_more" color="grey-5" @click="pageId='description'")
      // сферы + суть
      .row.full-width
        .row.full-width.col
          // суть
          .row.full-width.q-py-xs
            .row.col.justify-center.items-center
              span(:style=`{fontSize: fontSize+'px', textAlign: 'center', position: 'relative'}` @click="").text-white.cursor-pointer {{content.name}}
                q-badge(v-if="showBadge && $slots.badge" align="top" dark rounded color="green")
                  slot(name="badge")
                //q-icon(v-else name="fas fa-plus" size="10px" color="green" :style=`{right: '-14px', top: '5px'}`).absolute-top-right
          // spheres
          div(:style=`{minHeight: '32px'}`).row.full-width.content-start
            essence-spheres(:sphereOwner="content" :itemState="itemState")
      // author + essence + spheres + comments + images
      div(v-if="showAuthor").row.full-width.justify-between.q-px-sm
        q-btn(:to="'/user/'+content.author.oid" size="sm" round flat no-caps padding="none" :style=`{zIndex: '100'}`).q-pr-sm
          q-avatar(:size="'25px'" :style=`{position:'relative', overflow: 'hidden'}`).q-mr-xs
            //img(:src="content.author.thumbUrl" :to="'/user/'+content.author.oid")
            img(:src="content.author.thumbUrl" :to="'/user/'+content.author.oid")
            div(:style=`{background: 'rgba(0,0,0,0.4)', zIndex: '50'}`).fit.absolute
          .column.items-start
            span.text-grey-5 {{content.author.name}}
            small(v-if="author" :style=`{marginTop: '-7px'}`).text-grey-7.text-italic {{author.countStat.countSubscribers}} {{$getNoun(length, $t('подписчик'), $t('подписчика'), $t('подписчиков'))}}
        //q-btn(round flat padding="none" no-caps=false size="sm" color="green-8" :label="$t('подписаться')").col
        small(size="sm").row.items-center.text-grey-7.text-italic {{content.countStat.countViews}} {{$getNoun(content.countStat.countViews,$t('просмотр'),$t('просмотра'),$t('просмотров'))}}
      // popular nodes
      .row.full-width.items-center.q-px-sm
        span(@click="pageId='nodes'").text-grey-5.q-py-sm.q-pl-sm.cursor-pointer {{$t('Популярные смыслы')}}
        span(@click="pageId='nodes'").text-grey-8.q-pl-xs.cursor-pointer {{ content.countStat.countNodes }}
        q-icon(@click="pageId='nodes'" dense name="expand_more" color="grey-5"  size="14px").cursor-pointer
        list-feed-custom-horizontalPPV(v-if="pageWidth && content.countStat.countNodes > 0"
          ref="listFeed"
          :scrollAreaWidth="pageWidth"
          :scrollAreaHeight="120"
          :query="queryNodesPopular"
          :itemWidthApprox="120*1.618"
          :itemHeightApprox="120"
          :itemActivePersist="itemActivePersist"
          @count="$emit('count', $event)"
          @items="$emit('items', $event)")
          template(v-slot:item=`{item,itemState,itemIndex,isActive,isVisible,isPreload,scrolling}`)
            item-feed(
              :itemShortOrFull="item"
              :itemState="itemState"
              :itemIndex="itemIndex"
              :isActive="isActive"
              :isVisible="isVisible"
              :isPreload="isPreload"
              :scrolling="scrolling"
              :layout="'card-tiny'"
              :showContext="false"
              :height="120").q-px-xs
      // coments
      div(v-if="!pageId" :style=`{border: '1px solid rgb(50,50,50)', overflow: 'hidden'}`).row.full-width.q-mt-md.br-10
        q-resize-observer(@resize="imageMaxHeight = $q.screen.height - $event.height")
        // comments
        div(v-if="showComments").row.full-width.content-end.q-pt-md
          div(@click="pageId='comments'").cursor-pointer.row.full-width.items-center
            // div(:style=`{height: '1px', background: 'rgb(40,40,40)'}`).full-width
            span.text-grey-5.q-px-sm {{$t('Comments')}}
            span.text-grey-8 {{content.countStat.countComments}}
            .col
            q-btn(round flat dense :icon="pageId ? 'expand_less' : 'expand_more'" color="grey-5" :style=`{zIndex: '100'}`  @click="pageId='comments'")
            div(v-if="content.commentStat.topComment").row.full-width.items-center
              q-avatar(:size="'25px'" :style=`{position:'relative', overflow: 'hidden'}`).q-mx-xs.q-mb-xs
                img(:src="content.commentStat.topComment.author.thumbUrl" :to="'/user/'+content.commentStat.topComment.author.oid")
                div(:style=`{background: 'rgba(0,0,0,0.4)', zIndex: '50'}`).fit.absolute
              .col.content-center.q-px-xs
                small.text-grey.text-weight-thin.text-italic.q-pr-md {{content.commentStat.topComment.text.substring(0, 77)}}{{content.commentStat.topComment.text.length>77?'...':''}}
      // похожие
      div(v-if="false && !pageId && showSimilar").row.full-width.q-pt-lg
        .row.full-width.justify-start
          small.text-grey-8.q-pb-xs.q-px-xs {{$t('похожее')}}
        //small.text-grey.text-center.text-italic.q-px-xs "{{content.name.substring(0, 22)}}{{content.name.length>22 ? '...': ''}}"
        page-similar(:item="content")
</template>

<script>

import { RxCollectionEnum } from 'src/system/rxdb'
import contentView from './content_view'
import essenceSpheres from 'src/components/essence/essence_spheres'
import pageDescription from '../page_description/index.vue'
import listFeedCustomHorizontalPPV from 'src/components/list_feed/list_feed_horizontal_custom_ppv.vue'
import pageSimilar from '../page_similar/index.vue'
import pageComments from '../page_comments/index.vue'
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
    pageWidth: 0,
    contentView,
    essenceSpheres,
    listFeedCustomHorizontalPPV,
    pageSimilar,
    pageComments,
    navMobile,
    pageDescription,
  },
  data () {
    return {
      content: null,
      author: null,
      pageId: null, // description|comments|essences
      isFullScreen: false,
      bottomHeight: 0, // сколько места под образом
      imageMaxHeight: 0 // максимальная высота образа
    }
  },
  computed: {
    contentMaxHeight() {
      if (this.isFullScreen) return this.$q.screen.height
      else return this.$q.screen.height / 2
    },
    queryNodesPopular () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.content.oid,
          sortStrategy: 'ACTIVITY', // 'ACTIVITY', // AGE
          stack: 'item0'
        },
        populateObjects: false
      }
    }
  },
  watch: {
    '$screenProps.isHorizontal': { // перевернули телефон на бок
      handler(to) {
        this.isFullScreen = to
      }
    },
    async isFullScreen(to) {
      try { // генерит ошибку, если действие вызвано на пользователем
        if (to) await this.$q.fullscreen.request()
        else await this.$q.fullscreen.exit()
      } catch (err) {}
    }
  },
  methods: {
  },
  async mounted () {
    this.$logT('mounted', this.oid)
    this.content = await this.$rxdb.get(RxCollectionEnum.OBJ, this.oid)
    this.author = await this.$rxdb.get(RxCollectionEnum.OBJ, this.content.author.oid)
    this.$logT('mounted2', this.content)
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
