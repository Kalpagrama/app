<template lang="pug">
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-start.content-start
    tab-list-feed(
      :scrollAreaHeight="scrollAreaHeight || $q.screen.height"
      :navHeaderText="useNavHeader ? $t('Published') : ''"
      :searchInputState="searchInputState"
      :searchString="searchString"
      :pages="pages"
      :pageId="pageId"
      :query="query"
      nextSize=50
      :itemMiddlePersist="false"
      screenSize=100
      @searchString="searchString = $event"
      @pageId="pageId = $event"
      @searchInputState="$emit('searchInputState', $event)"
    ).row.full-width
      template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
        div(
          @click="onSelected(item)"
          :style=`{
                    background: 'rgb(35,35,35)',
                    borderRadius: '10px',
                  }`
        ).row.full-width.items-start.content-start.q-mb-sm
          img(
            v-if="!['WORD', 'SENTENCE', 'SPHERE'].includes(item.type)"
            draggable="false"
            :src="item.thumbUrl"
            :style=`{
                        height: '60px',
                        minWidth: '90px',
                        maxWidth: '90px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                      }`).b-50.q-mt-sm.q-ml-sm.q-mb-sm
          div(
            v-else
            :style=`{width: '90px', height: '60px',}`
          ).row.items-center.content-center.justify-center.q-mt-sm.q-ml-sm.q-mb-sm
            q-icon(name="blur_on" size="60px" color="white")
          .col.full-height
            .row.fit.items-between.content-between.q-pa-sm
              .row.full-width
                span.text-white.q-pt-sm {{ item.name }}
              .row.full-width
                small.text-grey-8 {{ itemType(item) }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'
import { assert } from 'src/system/common/utils'
import { objectTypeName, objectUrl } from '../../../system/common/object_info';

export default {
  name: 'pageSearch',
  components: {
    bookmarkListItem,
    bookmarkEditor
  },
  props: {
    scrollAreaHeight: { type: Number },
    useNavHeader: { type: Boolean, default: true },
    searchString: { type: String, default: '' },
    searchInputState: { type: String},
    mode: { type: String }
  },
  data () {
    return {
      pages: [
        { id: 'all', name: this.$t('All') },
        { id: 'nodes', name: this.$t('Nodes') },
        { id: 'joints', name: this.$t('Joints') },
        { id: 'blocks', name: this.$t('Blocks') },
        { id: 'contents', name: this.$t('Contents') },
        { id: 'users', name: this.$t('Users') },
        { id: 'spheres', name: this.$t('Spheres') }
      ],
      pageId: 'all'
    }
  },
  computed: {
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
          querySearch: this.searchString || 'any_random_values'
        },
        populateObjects: false,
        limit: 150
      }
    }
  },
  methods: {
    itemType (item) {
      return objectTypeName(item)
    },
    itemLink (item) {
      // this.$log('itemLink', item)
      if (item.wsItemType) {
        // confirm('Open in workspace?')
        return '/trends'
      } else {
        return objectUrl(item)
      }
    },
    onSelected (item) {
      if (this.mode === 'select') {
        this.$emit('item', item)
      } else {
        this.$router.push(this.itemLink(item))
      }
    }
  },
  mounted () {
    // this.$logW('this.$q.screen.height', this.$q.screen.height)
    // this.$logW('this.scrollAreaHeight', this.scrollAreaHeight)
  }
}
</script>
