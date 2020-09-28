<template lang="pug">
q-page(
  :style=`{paddingTop: '20px', paddingBottom: '400px'}`)
  .row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', overflow: 'hidden'}`).row.full-width
      span(:style=`{fontSize: '200px',}`).text-white.text-bold Explore {{sphere.oid}}
</template>

<script>
export default {
  name: 'pageApp_wsSphere_items',
  props: ['sphere'],
  data () {
    return {
    }
  }
}
</script>
