<template lang="pug">
.row.fit.items-end.content-end
  //- image
  div(v-if="item.type === 'IMAGE'").row.full-width
    img(
      :src="item.urlOriginal || item.url"
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        marginBottom: '72px',
      }`
      ).full-width
  //- node
  div(v-if="item.type === 'NODE'").row.full-width
    node-mini(:node="item" :isActive="false" :isVisible="false")
</template>

<script>
export default {
  name: 'linkFeed_linkItem',
  props: ['link', 'item'],
  data () {
    return {
    }
  }
}
</script>
