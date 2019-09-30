<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.bg-white
  //- editor dialog
  k-dialog(ref="wsBookmarkEditor" @hide="bookmark = null")
    ws-bookmark-editor(:bookmark="bookmark" @hide="$refs.wsBookmarkEditor.hide()")
  //- action create
  q-btn(
    round color="primary" size="lg" icon="add" @click="bookmarkCreate"
    :style=`{position: 'absolute', bottom: '10px', right: '10px', zIndex: 200}`)
  //- header
  div(:style=`{height: '70px'}`).row.full-width.items-center.content-center
    //- menu toggle
    div(:style=`{width: '70px'}`).row.items-center.content-center.justify-center
      q-btn(round flat icon="menu" color="primary" @click="$emit('menu')")
    //- name
    .col
      .row.fit.items-center.content-center.justify-center
        span.text-bold.text-black Закладки
    //- right action more
    div(:style=`{width: '70px'}`).row.items-center.content-center.justify-center
      q-btn(round flat icon="search" color="grey-6" @click="$refs.wsFilters.toggle()")
  //- body
  div(ignore-body-scroll-lock).col.scroll.full-width.bg-grey-2
    ws-filters(ref="wsFilters" :items="bookmarks")
      template(v-slot:items="{items}")
        div(:style=`{paddingBottom: '80px'}`).row.full-width.items-start.content-start.q-pt-sm.q-px-sm
          ws-bookmark-item(v-for="(b, bi) in items" :key="b.uid" :item="b" @clicked="bookmarkClick")
</template>

<script>
import wsBookmarkItem from './ws_bookmark_item'
import wsBookmarkEditor from './ws_bookmark_editor'
import wsFilters from './ws_filters'

export default {
  name: 'wsBookmarks',
  components: {wsBookmarkItem, wsBookmarkEditor, wsFilters},
  data () {
    return {
      bookmark: null
    }
  },
  computed: {
    bookmarks () {
      return this.$store.state.workspace.workspace.bookmarks
    }
  },
  methods: {
    bookmarkCreate () {
      this.$log('bookmarkCreate')
      this.$refs.wsBookmarkEditor.show()
    },
    bookmarkClick (b, bi) {
      this.$log('bookmarkClick')
      this.$set(this, 'bookmark', b)
      this.$nextTick(() => {
        this.$refs.wsBookmarkEditor.show()
      })
    },
    search () {
      this.$log('search')
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
