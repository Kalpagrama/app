<template lang="pug">
.row.full-width
  //- small.text-white {{item}}
  div(v-if="item.type === 'NODE'").row.full-width.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
      img(
        :src="item.items[0].thumbUrl"
        :style=`{
          borderRadius: '10px', overflow: 'hidden'
        }`
        ).full-width
</template>

<script>
export default {
  name: 'wsLink_linkItem',
  props: ['link', 'item'],
  data () {
    return {
    }
  }
}
</script>
