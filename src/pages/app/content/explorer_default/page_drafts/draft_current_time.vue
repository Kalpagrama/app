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
        placeholder="Создать на текущей секунде"
        @focus="itemFocused"
        ).full-width
    div(
      :style=`{
        width: '50px', height: '50px',
      }`
      ).row.items-center.content-center.justify-center
      q-btn(
        v-if="isFocused && item.name.length > 0"
        @click="itemEdit()"
        round flat color="green" icon="check")
  //- footer: meta, and timestamp
  .row.full-width.items-start.content-start
    small(
      v-if="contentKalpa.type === 'VIDEO'"
      ).text-grey-7.q-mr-xs {{ $time(player.currentTime) }}
    .col
    small.text-grey-7 {{ $date(isNow) }}
</template>

<script>
export default {
  name: 'draftCurrentTime',
  props: ['contentKalpa', 'player'],
  data () {
    return {
      isFocused: false,
      isNow: null,
      item: {
        name: ''
      }
    }
  },
  methods: {
    itemFocused () {
      this.$log('itemFocused')
      this.isFocused = true
      this.$emit('focused')
    },
    async itemEdit () {
      this.$log('itemEdit')
      // create draft and edit this shit ?
      // or just create draft
      // let nodeInput = {name: '', category: 'FUN'}
    }
  },
  mounted () {
    this.$log('mounted')
    this.isNow = Date.now()
  }
}
</script>
