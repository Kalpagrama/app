<template lang="pug">
.row.full-width
  .row.full-width.justify-center
    div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.justify-start.q-px-md.q-py-xl
      span(:style=`{fontSize: '30px'}` @click="$router.push('/help').catch(e => e)").text-green.text-bold.cursor-pointer Help
  .row.full-width
    router-view
</template>

<script>
export default {
  name: 'helpLayout',
  data () {
    return {
    }
  }
}
</script>
