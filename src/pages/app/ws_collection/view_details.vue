<template lang="pug">
q-page(
  :style=`{
    paddingTop: 98+paddingTop+'px',
  }`
  ).row.full-width.justify-center.items-start.content-start.q-px-sm
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width
    //- stats
    .row.full-width.q-pa-md
      span.text-white Элементов: {{ collection.bookmarks.length }}
    //- danger zone
    .row.full-width.q-mt-xl
      q-btn(
        @click="collectionDelete"
        flat color="red" no-caps).q-mt-xl Удалить коллекцию
</template>

<script>
export default {
  name: 'wsCollection_viewDetails',
  props: {
    collection: {type: Object},
    paddingTop: {
      type: Number,
      default: 0
    },
  },
  data () {
    return {
    }
  },
  methods: {
    collectionDelete () {
      this.$log('collectionDelete')
      // if we got items here...
    }
  }
}
</script>
