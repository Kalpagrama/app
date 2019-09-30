<template lang="pug">
div(
  @click="$emit('clicked', item)"
  :style=`{height: '80px', borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.items-center.content-center.q-px-md.bg-white.q-mb-sm
  img(:src="item.thumbUrl" :style=`{height: '50px', width: '88.88px', objectFit: 'contain', borderRadius: '10px', overflow: 'hidden'}`).bg-black
  .col.full-height.q-py-md
    .row.fit.items-start.content-start.q-px-sm
      span {{ item.name | cut(50) }}
</template>

<script>
export default {
  name: 'wsBookmarkItem',
  props: ['item'],
  data () {
    return {
    }
  }
}
</script>
