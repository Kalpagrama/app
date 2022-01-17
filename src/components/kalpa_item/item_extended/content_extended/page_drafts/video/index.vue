<template lang="pug">
page-drafts-root(
  v-bind="$props"
  @draft="$emit('draft', $event)")
  template(v-slot:header)
    .row.full-width.items-center.content-center.q-px-lg
      span.text-white.text-bold {{$t('Notes')}}
      .col
      q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  template(v-slot:draft=`{draft}`)
    div(
      v-if="draft.items[0] && draft.items[0].layers"
      ).row.full-width
      small.text-grey-8 {{ $time(draft.items[0].layers[0].figuresAbsolute[0].t) }}
</template>

<script>
import pageDraftsRoot from 'src/components/kalpa_item/item_extended/content_extended/page_drafts'

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
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
