<template lang="pug">
page-drafts-root(
  v-bind="$props"
  @draft="onDraftSelect")
  template(v-slot:header)
    .row.full-width.items-center.content-center.q-px-lg
      span.text-white.text-bold {{$t('Notes')}}
      .col
      q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  template(v-slot:draft=`{draft}`)
    div(
      v-if="draft.items[0] && draft.items[0].layers"
      :style=`{border: player && player.node && player.node.id === draft.id ? 'solid 2px ' + $getPaletteColor('green-8') :null, borderRadius: '5px'}`
      ).row.full-width
      .col
        .row.full-width
          small.text-white {{ draft.name }}
        small.text-grey-8 {{ $time(draft.items[0].layers[0].figuresAbsolute[0].t) }}
      q-btn(round flat no-caps outline icon="edit" color="green-8" @click.stop="onDraftEdit(draft)")
      q-btn(round flat no-caps outline icon="o_delete" color="red-8" @click.stop="onDraftDelete(draft)")
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
    onDraftSelect(draft) {
      this.$logT('onDraftSelect', draft)
      if (!this.player) return
      this.player.setState('node', draft)
      this.player.setState('nodeMode', 'focus')
      this.player.play()
    },
    onDraftEdit(draft) {
      this.$logT('onDraftEdit', draft)
      if (!this.player) return
      this.player.setState('node', draft)
      this.player.setState('nodeMode', 'edit')
    },
    onDraftDelete(draft) {
      this.$logT('onDraftDelete', draft)
      draft.remove(true)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
    if (this.player.nodeMode === 'focus'){
      this.player.setState('node', null)
      this.player.setState('nodeMode', null)
    }
  }
}
</script>
