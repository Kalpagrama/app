<template lang="pug">
div(
  :style=`{
    position: 'relative',
    minHeight: '40px',
  }`
  ).row.full-width.items-center.content-center.q-mb-sm
  //- header
  //- node name
  .row.full-width
    //- span.text-white {{ item.name }}
    q-input(
      v-model="item.name"
      dark dense borderless
      type="textarea" autogrow
      @focus="itemFocused = true"
      @blur="itemFocused = false"
      ).full-width
  //- figure footer
  .row.full-width
    small(
      v-if="contentKalpa.type === 'VIDEO'"
      ).text-grey-7.q-mr-xs {{ $time(item.items[0].layers[0].figuresAbsolute[0].t) }}
    .col
    small.text-grey-7 {{ $date(item.createdAt) }}
</template>

<script>
export default {
  name: 'draftItem',
  props: ['item', 'itemIndex', 'player', 'contentKalpa'],
  data () {
    return {
      itemFocused: false,
    }
  },
  watch: {
    itemFocused: {
      handler (to, from) {
        this.$log('itemFocused', to)
        if (to) {
          if (this.contentKalpa.type === 'VIDEO') {
            let t = this.item.items[0].layers[0].figuresAbsolute[0].t
            // set figure ?, but edit here ? or how ?
            this.player.setCurrentTime(t)
            // this.player.setState('figure', this.item.items[0].layers[0].figuresAbsolute)
          }
        }
      }
    }
  },
  methods: {
  },
}
</script>
