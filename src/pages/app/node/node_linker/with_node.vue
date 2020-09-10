<template lang="pug">
q-page.row.full-width.items-start.content-start.justify-center
  .row.full-width.q-px-md
    q-tabs(
      v-model="type"
      dense no-caps active-color="white" align="left" switch-indicator
      ).full-width.text-grey-8
      q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name")
  type-published(
    v-if="type === 'published'"
    mode="clicked"
    :searchString="searchString"
    @clicked="nodeClicked")
  type-saved(
    v-if="type === 'saved'"
    mode="clicked"
    :searchString="searchString"
    @clicked="nodeClicked")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

// import typeDrafts from 'pages/app/ws_nodes/type_drafts.vue'
import typeSaved from 'pages/app/ws_nodes/type_saved.vue'
import typePublished from 'pages/app/ws_nodes/type_published.vue'

export default {
  name: 'nodeLinker_withNode',
  components: {typeSaved, typePublished},
  props: ['searchString'],
  data () {
    return {
      type: 'published'
    }
  },
  computed: {
    types () {
      return [
        // {id: 'workspace.nodes.fragments', name: this.$t('pageApp_wsNodes_fragments', 'Фрагменты')},
        // {id: 'drafts', name: this.$t('pageApp_wsNodes_drafts', 'Черновики')},
        {id: 'published', name: this.$t('pageApp_wsNodes_published', 'Опубликованные')},
        {id: 'saved', name: this.$t('pageApp_wsNodes_saved', 'Сохраненные')},
      ]
    },
    queryNodes () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
          type: 'NODE'
          // stage: {$in: ['saved', 'published']}
        }
      }
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
  },
  methods: {
    nodeClicked (node) {
      this.$log('nodeClicked', node)
      this.$emit('item', node)
    }
  }
}
</script>
