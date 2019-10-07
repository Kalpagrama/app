<template lang="pug">
.row.full-width
  div(v-if="!searching").row.full-width.items-start.content-start.q-px-sm.q-pt-sm
    //- stat item
    div(
      v-for="(s, skey) in stats" :key="skey"
      @click="$emit('menu', skey)"
      :style=`{height: '70px', borderRadius: '10px', overflow: 'hidden'}`
      ).col-xs-12.col-sm-6.bg-white.q-mb-sm
      .row.fit.items-center.content-center.justify-center
        h6.text-bold.q-ma-xs {{ $store.getters[`workspace/${skey}Count`] }}
        .row.full-width.justify-center
          span {{ s.name }}
  //- search items wrapper
  div(v-else :style=`{paddingBottom: '80px'}`).row.full-width.items-start.content-start.q-px-sm.q-pt-sm
    component(v-for="(i, ii) in WSItems" :key="i.uid" :is="types[i.__typename]" :item="i")
</template>

<script>
// TODO: add animation of state change from search started and not
// TODO: add global style guide of animations
// import wsFragmentItem from 'ws_fragment_item'
import wsBookmarkItem from './ws_bookmark_item'

export default {
  name: 'workspace__dashboard',
  components: {wsBookmarkItem},
  data () {
    return {
      headerHeight: 200,
      search: '',
      searching: false,
      stats: {
        bookmarks: {name: 'Закладки'},
        contents: {name: 'Контенты'},
        fragments: {name: 'Фрагменты'},
        drafts: {name: 'Черновики'},
        tags: {name: 'Тэги'}
      },
      types: {
        WSBookmarkYoutube: 'wsBookmarkItem',
        WSTag: 'ws_tag_item',
        WSContent: 'ws_content_item',
        WSFragemnt: 'ws_fragment_item',
        WSDraft: 'ws_draft_item'
      }
    }
  },
  computed: {
    WSItems () {
      return this.$store.getters['workspace/WSItems']
    }
  },
  methods: {
    filtersToggle () {
      this.$log('filtersToggle')
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
