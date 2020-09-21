<style lang="sass" scoped>
.node-item
  &:hover
    background: rgba(80,80,80,0.1)
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    background: isSelected ? 'rgb(40,40,40)' : 'rgb(33,33,33)',
    border: isSelected ? '2px solid rgb(76,175,79)' : 'none'
  }`).row.full-width
  //- tint selector
  div(
    v-if="!isSelected"
    @click="$emit('select')"
    :style=`{
      position: 'absolute', zIndex: 500, top: 0, left: 0, bottom: 0, right: 0,
      borderRadius: '10px',
    }`
    ).row.fit.cursor-pointer.node-item
  //- selected body
  div(
    v-if="isSelected"
    :style=`{
      height: '40px',
      borderRadius: '10px 10px 0 0',
    }`).row.full-width
  //- top is selected
  div(
    :style=`{
      height: '40px',
    }`).row.full-width.items-stretch.content-stretch.q-px-sm
    div(
      :class=`{
        'b-50': isSelected
      }`
      :style=`{
        position: 'relative',
        borderRadius: '10px',
      }`).col
      .row.fit
        q-btn(flat no-caps dense).q-px-sm
          span.text-green.text-bold {{ $time(start) }}
        .col
        q-btn(
          v-if="isSelected"
          flat no-caps dense).q-px-sm
          span.text-grey-7 {{ $time(duration) }}
        .col
        q-btn(
          v-if="isSelected"
          flat no-caps dense).q-px-sm
          span.text-grey-6.text-bold {{ $time(end) }}
      composition-bar(
        v-if="isSelected"
        :composition="item" :player="player"
        :actionsPosition="'top'"
        :style=`{
          position: 'absolute', zIndex: 2000,
          top: '-33px', left: '0px', right: '0px',
          maxHeight: '40px',
        }`)
  //- essence editor
  .row.full-width
    q-input(
      v-model="node.name"
      borderless dark dense
      type="textarea" autogrow
      :placeholder="isSelected ? 'What do you see?' : ''"
      :input-style=`{
        minHeight: '40px',
        paddingLeft: '20px',
        paddingRight: '16px',
        borderRadius: '10px'
      }`
      :style=`{}`
      @focus="onFocus"
      @blur="onBlur"
      ).full-width
</template>

<script>
import compositionBar from 'components/composition/composition_bar/index.vue'

export default {
  name: 'nodeList',
  props: ['player', 'contentKalpa', 'node', 'isSelected'],
  components: {compositionBar},
  data () {
    return {
      // active: false,
    }
  },
  computed: {
    item () {
      return this.node.items[0]
    },
    start () {
      return this.item.layers[0].figuresAbsolute[0].t
    },
    end () {
      return this.item.layers[0].figuresAbsolute[1].t
    },
    duration () {
      return this.end - this.start
    }
  },
  watch: {
    // isSelected: {}
  },
  methods: {
    onFocus (e) {
      this.$log('onFocus', this.isSelected)
      // this.active = true
      // this.$emit('select')
      // if (!this.isSelected) this.player.setCurrentTime(this.start)
    },
    onBlur (e) {
      this.$log('onBlur', e)
      // this.active = false
    }
  }
}
</script>
