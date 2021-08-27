<template lang="pug">
page-collections(
  :collectionId="$route.params.id"
  @item="$emit('item', $event)")
  template(v-slot:header)
    div(
      :style=`{
        borderRadius: '10px',
      }`
    ).row.full-width.q-pa-sm.b-40
      q-btn(
        round flat color="white" icon="west"
        @click="$routerKalpa.back()"
      ).q-mr-sm
      span(:style=`{fontSize: '24px'}`).text-white.text-bold {{ $route.params.id }}
</template>

<script>
import pageCollections from '../page_collections/index.vue'

export default {
  name: 'pageCollection',
  components: {
    pageCollections
  },
  data () {
    return {
      collection: null,
      bookmarksRes: null,
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.id TO', to)
      }
    }
  }
}
</script>
