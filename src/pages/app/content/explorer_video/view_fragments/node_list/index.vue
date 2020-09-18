<template lang="pug">
div(
  :style=`{
    borderRadius: '10px',
    background: 'rgb(35,35,35)'
  }`).row.full-width
  //- small.text-white {{node}}
  div(
    :style=`{height: '40px'}`).row.full-width.items-stretch.content-stretch
    q-btn(flat no-caps).q-mr-xs
      span.text-green.text-bold {{ $time(start) }}
    div(
      :class=`{
        'b-40': isSelected
      }`
      :style=`{
        position: 'relative',
        borderRadius: '10px',
      }`).col
      //- q-btn(flat dense icon="play_arrow" color="green")
      composition-bar(
        v-if="isSelected"
        :composition="item" :player="player"
        :actionsPosition="'top'"
        :style=`{
          position: 'absolute', zIndex: 2000,
          top: '-33px', left: '0px', right: '0px',
          maxHeight: '40px',
        }`)
        template(v-slot:actions)
          q-btn(
            @click="$emit('edit')"
            round flat no-caps dense color="grey-6" icon="edit"
            ).q-ml-xs
  .row.full-width
    q-input(
      v-model="node.name"
      borderless dark
      type="textarea" autogrow
      placeholder="What do you see?"
      :input-style=`{
        minHeight: '40px',
        paddingLeft: '16px',
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
  props: ['player', 'contentKalpa', 'node', 'isSelected', 'isEditing'],
  components: {compositionBar},
  data () {
    return {
      active: false,
    }
  },
  computed: {
    item () {
      return this.node.items[0]
    },
    start () {
      return this.item.layers[0].figuresAbsolute[0].t
    }
  },
  methods: {
    onFocus (e) {
      this.$log('onFocus', this.isSelected)
      // this.active = true
      this.$emit('select')
      if (!this.isSelected) this.player.setCurrentTime(this.start)
    },
    onBlur (e) {
      this.$log('onBlur', e)
      this.active = false
    }
  }
}
</script>
