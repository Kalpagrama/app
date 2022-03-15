<template lang="pug">
.row.full-width.relative-position
  //transition(appear enter-active-class="animated slideInUp" leave-active-class="animated fadeOut")
  div(v-if="pageId"
    :style=`{ borderRadius: '20px 20px 0 0', height: bottomHeight + 'px'}`).row.full-width.b-30.absolute-top
    component(:is="'page-' + pageId"
      :item="content"
      :content="content"
      :contentKalpa="content"
      :player="player"
      :height="bottomHeight"
      @close="pageId=null")
  div(v-else).row.full-width
    // description expand btn
    .row.full-width
      // Название
      div(@click="pageId='description'").row.full-width.items-center.content-center.wrap.q-pt-xs.q-pl-sm.cursor-pointer
        //q-icon(name="select_all" color="white" size="36px").q-mr-sm
        .row.col
          span(:style=`{lineHeight: 1.2, fontSize: '15px'}`).text-white.text-bold.full-width {{ content.name }}
          //small(:style=`{lineHeight: 1.2}`).text-grey.full-width {{$t('Ознакомительный фрагмент')}}
        q-btn(v-if="true" round flat dense icon="expand_more" color="grey-5" @click="pageId='description'" :style=`{zIndex: '100'}`)
          q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Описание')}}
      // menu bar
      .row.full-width.content-center.items-center
        small(size="sm").row.items-center.text-grey-7.text-italic.q-pl-sm {{content.countStat.countViews}} {{$getNoun(content.countStat.countViews,$t('просмотр'),$t('просмотра'),$t('просмотров'))}}
        .col
        kalpa-save(:item="content" dense :isActive="true" inactiveColor="white" color="grey-2").q-pl-md
        kalpa-share(:item="content" :itemState="{}" :isActive="true" inactiveColor="white" color="grey-2" :headerText="$t('Share')")
      // origin
      .row.full-width.items-center.content-center.q-px-sm
        q-btn(v-if="content.urlOriginal && content.contentProvider !== 'KALPA'"
          @click="goOriginal"
          align="left"
          outline color="grey-3" no-caps
        :style=`{fontSize: '12px'}`)
          //- span.text-bold.text-grey-3 {{ 'Go to original' }}
          span.text-bold.text-grey-3 {{ $t('Источник') }}
          //- handle youtube
          q-icon(
            v-if="content.contentProvider === 'YOUTUBE'"
            name="fab fa-youtube" color="red" size="25px").q-mx-sm
          q-icon(
            v-if="content.contentProvider === 'INSTAGRAM'"
            name="fab fa-instagram" color="red" size="25px").q-mx-sm
          q-icon(
            v-if="content.contentProvider === 'CUSTOM_URL'"
            name="public" color="grey-3" size="25px").q-mx-sm
          span(
            v-if="content.contentProvider === 'YOUTUBE'"
          ).text-bold.text-grey-3 YouTube
          span(
            v-if="content.contentProvider === 'INSTAGRAM'"
          ).text-bold.text-grey-3 Instagram
          span(
            v-if="content.contentProvider === 'CUSTOM_URL'"
          ).text-bold.text-grey-3 {{ $t('интернет') }}
      div(v-if="content.contentProvider !== 'YOUTUBE' && content.contentProvider !== 'INSTAGRAM' && content.contentProvider !== 'CUSTOM_URL'").row.q-py-md
        q-btn(:to="'/user/'+content.author.oid" size="sm" round flat no-caps padding="none" :style=`{zIndex: '100'}`).q-px-sm
          q-avatar(:size="'30px'" :style=`{position:'relative', overflow: 'hidden'}`).q-mr-xs
            //img(:src="content.author.thumbUrl" :to="'/user/'+content.author.oid")
            img(:src="content.author.thumbUrl" :to="'/user/'+content.author.oid")
            div(:style=`{background: 'rgba(0,0,0,0.4)', zIndex: '50'}`).fit.absolute
          .column.items-start
            span(:style=`{fontSize: '12px'}`).text-grey-5 {{content.author.name}}
            small(v-if="author" :style=`{marginTop: '-4px', fontSize: '10px'}`).text-grey-7.text-italic {{author.countStat.countSubscribers}} {{$getNoun(author.countStat.countSubscribers.length,$t('подписчик'),$t('подписчика'),$t('подписчиков'))}}
        q-btn(
          v-if="content.author.oid !== $store.getters.currentUser.oid"
          flat :no-caps="following ? true : false" size="sm" :color="!following ? 'green-8' : 'grey-7'" :label="following ? $t('Вы подписаны') : $t('Follow')"
          @click="followingToggle()"
        ).q-ml-lg
      // сферы
      div(v-if="content.spheres.length > 0").row.full-width.q-pt-sm
        .row.full-width.col
          //q-icon(v-else name="fas fa-plus" size="10px" color="green" :style=`{right: '-14px', top: '5px'}`).absolute-top-right
          // spheres
          div(:style=`{minHeight: '32px'}`).row.full-width.content-start
            span.text-grey-5.q-pl-md {{ $t('Сферы') }}
            essence-spheres(:sphereOwner="content" :itemState="itemState")
      // drafts
      .row.full-width.items-center.q-px-sm
        span(@click="pageId='drafts-' + content.type.toLowerCase()").text-grey-5.q-py-sm.q-pl-sm.cursor-pointer {{$t('Мои заметки на этом контенте')}}
        q-icon(@click="pageId='drafts-' + content.type.toLowerCase()" dense name="expand_more" color="grey-5"  size="14px").cursor-pointer
      // popular nodes
      .row.full-width.items-center.q-px-sm
        span(@click="pageId='nodes-' + content.type.toLowerCase()").text-grey-5.q-py-sm.q-pl-sm.cursor-pointer {{$t('Популярные смыслы')}}
        span(@click="pageId='nodes-' + content.type.toLowerCase()").text-grey-8.q-pl-xs.cursor-pointer {{ content.countStat.countNodes }}
        q-icon(@click="pageId='nodes-' + content.type.toLowerCase()" dense name="expand_more" color="grey-5"  size="14px").cursor-pointer
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
              :muted="true"
              :itemIndex="itemIndex"
              :isActive="isActive"
              :isVisible="isVisible"
              :isPreload="isPreload"
              :scrolling="scrolling"
              :layout="'card-tiny'"
              :showContext="false"
              :height="120").q-px-xs
      // comments
      div(v-if="!pageId" :style=`{border: '1px solid rgb(50,50,50)', overflow: 'hidden'}` @click="pageId='comments'").row.full-width.q-mt-md.br-10.cursor-pointer
        // comments
        div(v-if="showComments").row.full-width.items-center.content-center.q-py-sm
          div(@click="pageId='comments'").row.cursor-pointer.row.full-width.items-center
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
    div(v-if="showSimilar").row.full-width.q-pt-lg
      .row.full-width.justify-start
        small.text-grey-8.q-pb-xs.q-px-xs {{$t('похожее')}}
      //small.text-grey.text-center.text-italic.q-px-xs "{{content.name.substring(0, 22)}}{{content.name.length>22 ? '...': ''}}"
      page-similar(:item="content")
</template>

<script>
import pageNodesVideo from 'src/components/kalpa_item/item_extended/content_extended/page_nodes/video'
import pageDraftsVideo from 'src/components/kalpa_item/item_extended/content_extended/page_drafts/video'
import pageNodesBook from 'src/components/kalpa_item/item_extended/content_extended/page_nodes/book'
import pageDraftsBook from 'src/components/kalpa_item/item_extended/content_extended/page_drafts/book'
import pageNodesImage from 'src/components/kalpa_item/item_extended/content_extended/page_nodes/image'
import pageDraftsImage from 'src/components/kalpa_item/item_extended/content_extended/page_drafts/image'
import essenceSpheres from 'src/components/essence/essence_spheres'
import pageDescription from '../page_description/index.vue'
import listFeedCustomHorizontalPPV from 'src/components/list_feed/list_feed_horizontal_custom_ppv.vue'
import pageSimilar from 'src/components/kalpa_item/item_extended/page_similar'
import pageComments from 'src/components/kalpa_item/item_extended/page_comments/index.vue'
import { openURL } from 'quasar'
import { RxCollectionEnum } from 'src/system/rxdb'
import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'
import {UserApi} from '../../../../api/user';
export default {
  name: 'contentInfo',
  props: {
    content: { type: Object },
    player: { type: Object },
    author: { type: Object },
    pageWidth: { type: String },
    bottomHeight: { type: Number },
    showActions: { default: true },
    showAuthor: { default: true },
    showComments: { default: true },
    showSimilar: { default: true }
  },
  components: {
    pageNodesVideo,
    pageDraftsVideo,
    pageNodesBook,
    pageDraftsBook,
    pageNodesImage,
    pageDraftsImage,
    essenceSpheres,
    listFeedCustomHorizontalPPV,
    pageSimilar,
    pageComments,
    pageDescription,
  },
  data () {
    return {
      pageId: null, // description|comments|essences
      following: null,
    }
  },
  computed: {
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
    immediate: true,
    'player.nodeMode': {
      handler(to) {
        if (to === 'focus'){
          assert(this.player.node)
          this.pageId = 'nodes-' + this.content.type.toLowerCase()
        }
      }
    },
    author: {
      immediate: true,
      async handler (to, from) {
        this.$log('user TO')
        if (to) {
          this.following = await UserApi.isSubscribed(to.oid)
          this.followingConfirmed = true
        }
      }
    },
  },
  methods: {
    goOriginal () {
      this.$log('goOriginal')
      if (this.content.contentProvider === 'YOUTUBE' || this.content.contentProvider === 'INSTAGRAM') {
        let arr = this.content.urlOriginal.split('/')
        let isEmbed = arr[arr.length - 2] === 'embed'
        if (isEmbed) openURL(`https://www.youtube.com/watch?v=${arr[arr.length - 1]}`)
        else openURL(this.content.urlOriginal)
      }
      else {
        return ''
      }
    },
    async followingToggle () {
      this.$log('followingToggle')
      let following = await UserApi.isSubscribed(this.author.oid)
      if (following) {
        this.following = false
        await UserApi.unSubscribe(this.author.oid)
      }
      else {
        this.following = true
        await UserApi.subscribe(this.author.oid)
      }
      // TODO: handle await for real data from this query
      // this.following = await UserApi.isSubscribed(this.user.oid)
      // this.followingConfirmed = true
    }
  }
}
</script>
