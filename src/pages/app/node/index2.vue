<template lang="pug">
  kalpa-layout()
    template(v-slot:footer)
      kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
        template(v-slot:leftButton)
          navMobile
        template(v-slot:center)
          .row.content-center
            span.text-grey-7 {{$t('Essence core')}}
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
          transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
            div(v-if="!pageId").row.full-width
              q-resize-observer(@resize="imagesMaxHeight = $q.screen.height - $event.height")
              // spheres
              .row.full-width
                .col
                  essence-spheres(v-if="node.spheres.length > 0" :node="node" :itemState="itemState")
                // description expand btn
                q-btn(v-if="node.description" round flat dense :icon="pageId ? 'expand_less' : 'expand_more'" color="white" @click="pageId='description'")
              // суть
              .row.full-width.q-pt-sm
                .row.col.justify-center
                  span(:style=`{fontSize: fontSize+'px', textAlign: 'center', position: 'relative'}` @click="pageId='essences'").text-white.cursor-pointer {{node.name}}
                    q-badge(v-if="sameCompositionNodesItemsRes && sameCompositionNodesItemsRes.items.length > 1"
                      align="top" dark rounded color="green") {{sameCompositionNodesItemsRes.items.length}}
                    q-icon(v-else name="fas fa-plus" size="10px" color="green" :style=`{right: '-14px', top: '5px'}`).absolute-top-right
              // author
              q-btn(:to="'/user/'+node.author.oid" size="sm" round flat color="grey" no-caps padding="none").q-pl-sm
                q-avatar(:size="'20px'")
                  img(:src="node.author.thumbUrl" :to="'/user/'+node.author.oid")
                span() {{node.author.name}}
          essence-actions(v-if="!pageId"
            :essence="node"
            :itemState="itemState"
            :nodeBackgroundColor="'rgb(30,30,30)'"
            :nodeActionsColor="'rgb(200,200,200)'"
            :isActive="true"
            :isVisible="true")
          // comments
          transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
            div(v-if="!pageId" @click="pageId='comments'").cursor-pointer.row.full-width.items-center.q-py-md
              //q-separator(dark).full-width.q-mt-md
              span.text-grey.q-pl-sm {{$t('Comments')}} ● {{node.countStat.countComments}}
              .col.scroll.q-px-md
                div(v-if="node.commentStat.topComment").row.full-width.items-center.content-center.no-wrap
                  span.text-grey.text-weight-thin.text-italic.q-pr-md {{node.commentStat.topComment.text}}
                  q-btn(v-for="(c,id) in node.commentStat.randomComments" :key="id"
                    :to="'/user/'+c.author.oid" size="sm" round flat color="grey" no-caps padding="none"
                    :style=`{ whiteSpace: 'nowrap' }`).q-pl-xs
                    q-avatar(:size="'20px'")
                      img(:src="c.author.thumbUrl" :to="'/user/'+c.author.oid")
                    // span() {{c.author.name}}
              q-btn(round flat dense :icon="pageId ? 'expand_less' : 'expand_more'" color="white" @click="pageId='comments'")
              //q-separator(dark).full-width.q-mt-md
          page-similar(v-if="!pageId" :node="node")
</template>

<script>

import { RxCollectionEnum } from 'src/system/rxdb'
import pageSimilar from './page_similar/index.vue'
import pageComments from './page_comments/index.vue'
import pageDescription from './page_description/index.vue'
import pageEssences from './page_essences/index.vue'
import pageImages from './page_images/index.vue'
import essenceSpheres from 'src/components/essence/essence_spheres'
import essenceActions from 'src/components/essence/essence_actions.vue'
import cloneDeep from 'lodash/cloneDeep'
import navMobile from '../../../components/kalpa_menu_mobile/nav_mobile';

export default {
  name: 'pageApp_node2',
  components: {
    pageSimilar,
    navMobile,
    pageComments,
    pageDescription,
    pageEssences,
    essenceActions,
    essenceSpheres,
    pageImages
  },
  data () {
    return {
      node: null,
      slide: 1,
      pageId: null,
      bottomHeight: 0,
      imagesMaxHeight: 0,
      isActive: true,
      sameCompositionNodesItemsRes: null, // ядра с тем же образом
      itemState: {}
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
    async node (to) {
      // this.$log('node to=', to)
      this.pageId = null
      this.sameCompositionNodesItemsRes = null
      this.itemState = {}
      this.isActive = true
      if (to) {
        if (this.$route.params.oid !== to.oid) await this.$router.replace({ params: { oid: to.oid } })
        this.sameCompositionNodesItemsRes = await this.$rxdb.find({
          selector: {
            rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
            objectTypeEnum: { $in: ['NODE'] },
            oidSphere: this.node.items[0].oid,
            sortStrategy: 'ESSENTIALLY' // 'ACTIVITY', // AGE
          },
          populateObjects: false
        })
        this.$log('sameCompositionNodesItemsRes=', this.sameCompositionNodesItemsRes)
      }
    }
  },
  computed: {
    fontSize () {
      let l = this.node.name.length
      if (l < 20) return 22
      else if (l < 30) return 20
      else if (l < 40) return 16
      else return 14
    }
  },
  methods: {},
  async mounted () {
    this.$log('mounted node=', this.node)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
