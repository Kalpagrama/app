<template lang="pug">
page-bookmarks(
  :useHeader="false"
  :height="height"
  :pagesFilter="pagesFilter"
  mode="select"
  @bookmark="$emit('item', $event)")
</template>

<script>
import pageBookmarks from 'pages/app/workspace/page_bookmarks/index.vue'

export default {
  name: 'kalpaFinder_pageWorkspace',
  props: ['height'],
  components: {
    pageBookmarks,
  },
  methods: {
    pagesFilter (pages) {
      return pages.filter(p => {
        // return p.id !== 'joints'
        return !['joints', 'spheres'].includes(p.id)
      })
    }
  }
}
</script>
