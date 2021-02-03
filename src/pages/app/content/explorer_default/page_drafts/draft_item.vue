<template lang="pug">
div(
  :style=`{
    position: 'relative',
    minHeight: '40px',
  }`
  ).row.full-width.items-center.content-center.q-mb-sm
  //- header: name and edit btn
  .row.full-width
    .col
      q-input(
        v-model="item.name"
        dark dense borderless
        type="textarea" autogrow
        @focus="itemFocused"
        ).full-width
    div(
      :style=`{
        width: '50px', height: '50px',
      }`
      ).row.items-center.content-center.justify-center
      q-btn(
        v-if="isSelected"
        @click="itemEdit()"
        round flat color="white" icon="edit")
  //- footer: meta, and timestamp
  .row.full-width.items-start.content-start
    small(
      v-if="contentKalpa.type === 'VIDEO'"
      ).text-grey-7.q-mr-xs {{ $time(item.items[0].layers[0].figuresAbsolute[0].t) }}
    .col
    small.text-grey-7 {{ $date(item.createdAt) }}
</template>

<script>
export default {
  name: 'draftItem',
  props: ['item', 'itemIndex', 'player', 'contentKalpa', 'isSelected'],
  data () {
    return {
    }
  },
  watch: {
  },
  methods: {
    itemFocused () {
      this.$log('itemFocused')
      this.$emit('set-selected')
      if (this.contentKalpa.type === 'VIDEO') {
        let t = this.item.items[0].layers[0].figuresAbsolute[0].t
        this.player.setCurrentTime(t)
      }
    },
    itemEdit () {
      this.$log('itemEdit')
      this.$store.commit('ui/stateSet', ['nodeDraft', this.item])
      this.player.setState('figure', this.item.items[0].layers[0].figuresAbsolute)
    }
  },
}
</script>
