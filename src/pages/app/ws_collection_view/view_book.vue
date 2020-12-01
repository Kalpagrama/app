<template lang="pug">
q-page(
  :style=`{
    paddingTop: '0px',
  }`
  ).row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-start.content-start
    //- small.text-white {{collection}}
    //- draggable(v-model="node.items" handle=".handle").full-width
    //- book()
</template>

<script>
export default {
  name: 'wsCollectionView_viewBook',
  props: ['collection', 'view'],
  components: {
    // book: () => import('pages/app/ws_index/groups/index.vue')
  },
  data () {
    return {
    }
  }
}
</script>
