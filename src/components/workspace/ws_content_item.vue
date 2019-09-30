<template lang="pug">
div(
  @click="$emit('clicked', item)"
  :style=`{height: '80px', borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.bg-white.q-mb-sm
  img(:src="item.content.thumbUrl[0]" :style=`{height: '100%', borderRadius: '10px', overflow: 'hidden'}`)
  .col
    .row.fit.items-start.content-start.q-px-sm
      span {{ item.name | cut(50) }}
</template>

<script>
export default {
  name: 'wsContentItem',
  props: ['item'],
  data () {
    return {
    }
  }
}
</script>
