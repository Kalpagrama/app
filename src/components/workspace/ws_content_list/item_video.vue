<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '100px',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.full-width.b-60.q-mb-sm
  img(
    :src="content.thumbOid"
    :style=`{
      height: '120px',
      borderRadius: '10px',
      overflow: 'hidden'
    }`)
  .col.full-height
    .row.fit.items-between.content-between.q-pa-md
      span.text-white.text-bold {{ content.name }}
      .row.full-width
        small.text-grey-4 {{ contentKalpa.name }}
</template>

<script>
export default {
  name: 'itemVideo',
  props: ['content', 'contentKalpa'],
  data () {
    return {
    }
  }
}
</script>
