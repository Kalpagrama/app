<template lang="pug">
page-drafts-root(
  v-bind="$props"
  @draft="$emit('draft', $event)")
  template(v-slot:draft=`{draft}`)
    div(
      v-if="draft.items[0] && draft.items[0].layers"
      ).row.full-width
      small.text-grey-8 {{ $time(draft.items[0].layers[0].figuresAbsolute[0].t) }}
</template>

<script>
import pageDraftsRoot from '../../page_drafts_root/index.vue'

export default {
  name: 'pageDrafts',
  props: ['contentKalpa', 'player'],
  components: {
    pageDraftsRoot
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
