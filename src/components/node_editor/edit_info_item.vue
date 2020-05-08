<template lang="pug">
div(:style=`{borderRadius: '10px'}`).row.full-width.bg-grey-8
  .row.full-width.q-pa-md
    span.text-white {{ item.name }}
  .row.full-width.items-center.content-center.q-pa-md
    q-btn(round push color="green" icon="keyboard_arrow_down" @click="count -= 1")
    .col.full-height
      .row.fit.items-center.content-center.justify-center
        span.text-white Count:
        span.text-white.text-bold.q-mx-sm {{ count }}
    q-btn(round push color="green" icon="keyboard_arrow_up" @click="count += 1")
</template>

<script>
export default {
  name: 'editInfo-item',
  props: ['item', 'index'],
  data () {
    return {
      count: 0
    }
  },
  watch: {
    item: {
      immediate: true,
      handler (to, from) {
        this.$log('item CHANGED', to)
      }
    }
  },
  mounted () {
    this.$log('moutned')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
