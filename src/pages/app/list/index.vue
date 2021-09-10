<template lang="pug">
  kalpa-layout
    template(v-slot:footer)
      kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
    template(v-slot:body)
      component(:is="'list-' + listName")
</template>

<script>
import listCollections from 'src/components/kalpa_lists/collections.vue'
import listContents from 'src/components/kalpa_lists/contents.vue'
import listDrafts from 'src/components/kalpa_lists/drafts.vue'
import listHistory from 'src/components/kalpa_lists/history.vue'
import listPublished from 'src/components/kalpa_lists/published.vue'
import listSearch from 'src/components/kalpa_lists/search.vue'

export default {
  name: 'pageLists',
  props: ['listName'],
  components: {
    listCollections,
    listContents,
    listDrafts,
    listHistory,
    listPublished,
    listSearch,
  },
  created(){
    this.$logW('CREATED', this.listName)
  }
}
</script>
