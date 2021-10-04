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
            div(v-if="!pageId" :style=`{borderRadius: '5px', border: '1px solid rgb(40,40,40)', overflow: 'hidden'}`).row.full-width.q-mt-sm
              q-resize-observer(@resize="imagesMaxHeight = $q.screen.height - $event.height")
              q-tab-panels(
                v-model="currentIndx"
                :swipeable="true || $q.platform.is.mobile"
                :animated="true || $q.platform.is.mobile"
                dark).full-width
                q-tab-panel(v-for="(node,ix) in sameCompositionNodesItemsRes ? sameCompositionNodesItemsRes.items : [node]" :key="ix" :name="ix").full-width.q-pa-none
                  page-essence(:oid="node.oid" @description="pageId='description'" @essences="pageId='essences'").q-pb-sm
              // список других сутей
              div(v-if="sameCompositionNodesItemsRes").row.full-width
                q-btn(:disable="!itemsLeft.length" dense round flat icon="chevron_left" color="white"
                  size="xs" :style=`{zIndex: '100'}` @click="currentIndx--")
                small.text-grey.text-capitalize.text-weight-thin.q-mt-xs  {{$t('еще')}}
                small.text-green.text-bold.q-px-xs.q-mt-xs  {{sameCompositionNodesItemsRes.items.length}}
                small.text-grey.text-weight-thin.q-mt-xs  {{$t('смысла(ов) на образ')}}
                small.text-grey.text-italic.q-pl-xs.q-mt-xs "{{node.items[0].layers[0].contentName.substring(0, 12)}}{{node.items[0].layers[0].contentName.length > 12 ? '...': ''}}"
                .col.q-px-xs
                  q-btn(dense round flat no-caps no-wrap  icon="add" size="sm" color="green" :label="$t('Add essence')" @click="pageId='essences'").full-width.ellipsis
                q-btn(:disable="!itemsRight.length" dense round flat icon="chevron_right" color="white"
                  size="xs" :style=`{zIndex: '100'}` @click="currentIndx++")
          // comments
          transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
            div(v-if="!pageId" @click="pageId='comments'" ).cursor-pointer.row.full-width.items-center.q-py-md
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
          div(:style=`{height: '1px', background: 'rgb(40,40,40)'}`).full-width
          small.text-grey.text-center {{$t('Ядра, связанные со смыслом')}}
          small.text-grey.text-center.text-italic.q-px-xs "{{node.name.substring(0, 22)}}{{node.name.length>22 ? '...': ''}}"
          page-similar(v-if="!pageId" :node="node")
</template>

<script>

import { RxCollectionEnum } from 'src/system/rxdb'
import pageSimilar from './page_similar/index.vue'
import pageComments from './page_comments/index.vue'
import pageDescription from './page_description/index.vue'
import pageEssences from './page_essences/index.vue'
import pageEssence from './page_essence/index.vue'
import pageImages from './page_images/index.vue'

export default {
  name: 'pageApp_node2',
  components: {
    pageSimilar,
    pageComments,
    pageDescription,
    pageEssences,
    pageEssence,
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
    async node (to) {
      // this.$log('node to=', to)
      this.pageId = null
      this.sameCompositionNodesItemsRes = null
      this.isActive = true
      if (to) {
        this.currentIndx = -1
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
        this.currentIndx = this.sameCompositionNodesItemsRes.items.findIndex(item => item.oid === this.node.oid)
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
    },
    itemsRight () {
      if (this.currentIndx >= 0) return this.sameCompositionNodesItemsRes.items.slice(this.currentIndx + 1, this.sameCompositionNodesItemsRes.items.length)
      return []
    },
    itemsLeft () {
      if (this.currentIndx >= 0) return this.sameCompositionNodesItemsRes.items.slice(0, this.currentIndx)
      return []
    },
    length () {
      if (this.sameCompositionNodesItemsRes) return this.sameCompositionNodesItemsRes.items.length
      return 0
    },
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
