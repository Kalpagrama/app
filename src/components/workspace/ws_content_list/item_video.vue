<style lang="sass" scoped>
.item
  cursor: pointer
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(
  @click="$emit('pick')"
  :style=`{
    position: 'relative',
    height: '100px',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.full-width.b-60.q-mb-sm.item
  img(
    :src="content.thumbOid"
    :style=`{
      height: '120px',
      borderRadius: '10px',
      overflow: 'hidden'
    }`)
  .col.full-height
    .row.fit.items-between.content-between.q-pa-sm
      span.text-white.text-bold {{ content.name }}
      .row.full-width
        small.text-grey-5 {{ contentKalpa.name }}
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
