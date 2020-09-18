<template lang="pug">
.row.full-width
  div(
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
    }`
    ).row.full-width.items-center.content-center.b-40
    div(
      @click="$emit('clicked')"
      :style=`{
        position: 'relative', zIndex: 100,
        cursor: 'pointer',
        borderRadius: '10px', overflow: 'hidden',
      }`
      ).row.full-width.items-center.content-center.sphere-item.b-40
      img(
        :src="content.thumbUrl"
        :style=`{
          width: '40px', height: '40px',
          borderRadius: '10px', overflow: 'hidden',
          objectFit: 'cover'
        }`).q-ma-md
      .col.full-height
        .row.fit.items-center.content-center.q-pr-sm
          small(:style=`{userSelect: 'none'}`).text-white {{ content.name.slice(0, 40) }}
  slot(name="footer")
</template>

<script>
export default {
  name: 'wsContentItem',
  props: ['content'],
}
</script>
