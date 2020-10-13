<template lang="pug">
.row.fit
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
  div(
    v-if="item.type === 'NODE'"
    :style=`{
      borderRadius: '10px',
    }`
    ).column.fit.b-50
    .col.full-width
      node-mini(:node="item" :isActive="isActive" :isVisible="isVisible")
      //- img(
        :src="item.items[0].thumbUrl"
        :style=`{
          borderRadius: '10px', overflow: 'hidden',
          objectFit: 'contain',
        }`).fit
    //- .row.full-width.items-center.content-center.justify-center.q-pa-sm
      span.text-white {{ item.name }}
    .row.full-width
      slot(name="footer")
</template>

<script>
export default {
  name: 'linkFeed_linkItem',
  props: ['link', 'item', 'isActive', 'isVisible'],
  data () {
    return {
    }
  }
}
</script>
