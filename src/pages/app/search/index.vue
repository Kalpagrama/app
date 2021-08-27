<template lang="pug">
  kalpa-layout(
    :height="_height")
    template(v-slot:header)
      div(
        v-if="useHeader"
      ).row.full-width.justify-center.q-px-sm.q-pt-sm.b-30
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          slot(name="header")
          div(
            v-if="!$slots.header"
            :style=`{
            height: '60px',
            borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.q-pa-sm.b-40
            q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()")
            .col.full-height
              .row.fit.items-center.content-center.justify-center
                span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('Search')}}
            q-btn(round flat color="white" icon="more_vert")
    template(v-slot:body)
      div(:style=`{paddingTop: useHeader ? '76px' : '0px',}`).row.full-width.items-start.content-start
        //- bookmark editor
        q-dialog(
          v-model="bookmarkEditorShow"
          :full-width="$q.screen.xs"
          :full-height="$q.screen.xs"
          :maximized="$q.screen.xs"
          :square="$q.screen.xs"
          @hide="bookmarkSelected = null")
          bookmark-editor(
            :bookmark="bookmarkSelected"
            @close="bookmarkEditorShow = false, bookmarkSelected = null")
        //- search bar
        div(v-if="searchStringShow").row.full-width.justify-center.q-px-sm
          div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width
            q-input(
              v-model="searchString"
              borderless dark
              :placeholder="$t('Search')"
              :input-style=`{
              padding: '16px',
              background: 'rgb(40,40,40)',
              borderRadius: '10px',
            }`
            ).full-width
        //- tabs sticky
        div(
          :style=`{
          position: 'sticky', top: '0px', zIndex: 1000,
        }`).row.full-width.q-px-md.b-30
          q-tabs(
            v-model="pageId"
            switch-indicator no-caps dense
            active-color="green"
          ).full-width.text-grey-8
            q-tab(
              v-for="(p,pi) in pages" :key="p.id"
              :name="p.id" :label="p.name")
        //- tab panels
        q-tab-panels(
          v-model="pageId"
          :swipeable="$q.platform.is.mobile"
          :animated="$q.platform.is.mobile"
          :style=`{}`).full-width.b-30
          q-tab-panel(
            v-for="(p,pi) in pages" :key="p.id" :name="p.id"
            :style=`{
            background: 'none',
            minHeight: '70vh',
          }`
          ).row.full-width.items-start.content-start.justify-center.q-pa-sm
            list-feed(
              :query="query"
              nextSize=50
              :itemMiddlePersist="false"
              screenSize=100
              :style=`{
              maxWidth: $store.state.ui.pageWidth+'px',
            }`)
              template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
                div(
                  @click="onSelected(item)"
                  :style=`{
                  background: 'rgb(35,35,35)',
                  borderRadius: '10px',
                }`
                ).row.full-width.items-start.content-start
                  img(
                    v-if="!['WORD', 'SENTENCE', 'SPHERE'].includes(item.type)"
                    draggable="false"
                    :src="item.thumbUrl"
                    :style=`{
                      height: '50px',
                      minWidth: '89px',
                      borderRadius: '10px',
                      objectFit: 'contain',
                    }`).b-50
                  div(
                    v-else
                    :style=`{width: '50px', height: '50px',}`
                  ).row.items-center.content-center.justify-center
                    q-icon(name="blur_on" size="30px" color="white")
                  .col.full-height
                    .row.fit.items-between.content-between.q-pa-sm
                      .row.full-width
                        span.text-white {{ item.name }}
                      .row.full-width
                        small.text-grey-8 {{ item.type }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'
import { assert } from 'src/system/utils'

export default {
  name: 'pageSearch',
  props: {
    height: { type: Number },
    useHeader: { type: Boolean, default: true },
    searchString: { type: String, default: '' },
    searchStringShow: { type: String, default: true },
    mode: { type: String },
    pagesFilter: { type: Function }
  },
  components: {
    bookmarkListItem,
    bookmarkEditor
  },
  data () {
    return {
      pageId: 'all',
      bookmarkSelected: null,
      bookmarkEditorShow: false
    }
  },
  computed: {
    _height () {
      return this.height || this.$q.screen.height
    },
    pages () {
      let pages = [
        { id: 'all', name: this.$t('All') },
        { id: 'nodes', name: this.$t('Nodes') },
        { id: 'joints', name: this.$t('Joints') },
        { id: 'blocks', name: this.$t('Blocks') },
        { id: 'contents', name: this.$t('Contents') },
        { id: 'users', name: this.$t('Users') },
        { id: 'spheres', name: this.$t('Spheres') }
      ]
      if (this.pagesFilter) return this.pagesFilter(pages)
      else return pages
    },
    query () {
      let objectTypes
      if (this.pageId === 'all') {
        objectTypes = ['VIDEO', 'IMAGE', 'BOOK', 'NODE', 'BLOCK', 'USER', 'JOINT', 'WORD', 'SENTENCE', 'CHAR']
      } else if (this.pageId === 'nodes') {
        objectTypes = ['NODE']
      } else if (this.pageId === 'joints') {
        objectTypes = ['JOINT']
      } else if (this.pageId === 'blocks') {
        objectTypes = ['BLOCK']
      } else if (this.pageId === 'contents') {
        objectTypes = ['VIDEO', 'IMAGE', 'BOOK']
      } else if (this.pageId === 'users') {
        objectTypes = ['USER']
      } else if (this.pageId === 'spheres') {
        objectTypes = ['WORD', 'SENTENCE', 'CHAR']
      } else throw new Error('bad pageId: ' + this.pageId)

      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SEARCH,
          objectTypeEnum: { $in: objectTypes },
          querySearch: this.searchString || 'any_random_values',
        },
        populateObjects: false,
        limit: 150
      }
    },
    itemMetaMap () {
      return {
        VIDEO: {
          name: this.$t('Video'),
          link: '/content/'
        },
        IMAGE: {
          name: this.$t('Image'),
          link: '/content/'
        },
        BOOK: {
          name: this.$t('Book'),
          link: '/content/'
        },
        NODE: {
          name: this.$t('Node'),
          link: '/node/'
        },
        JOINT: {
          name: this.$t('Joint'),
          link: '/joint/'
        },
        BLOCK: {
          name: this.$t('Essence block'),
          link: '/block/'
        },
        WORD: {
          name: this.$t('Sphere'),
          link: '/sphere/'
        },
        SENTENCE: {
          name: this.$t('Sphere'),
          link: '/sphere/'
        },
        SPHERE: {
          name: this.$t('Sphere'),
          link: '/sphere/'
        },
        USER: {
          name: this.$t('User'),
          link: '/user/'
        }
      }
    }
  },
  methods: {
    itemLink (item) {
      // this.$log('itemLink', item)
      if (item.wsItemType) {
        // confirm('Open in workspace?')
        return '/trends'
      }
      else {
        return this.itemMetaMap[item.type].link + item.oid
      }
    },
    onSelected(item) {
      if (this.mode === 'select') {
        this.$emit('item', item)
      } else {
        this.$router.push(this.itemLink(item))
      }
    }
  }
}
</script>
