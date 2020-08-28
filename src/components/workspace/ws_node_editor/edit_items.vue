<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
  //- thumbnails
  //- q-carousel(
    swipeable
    animated
    v-model="slide"
    infinite
    :style=`{
      borderRadius: '10px',
    }`).full-width
    //- :img-src="i.thumbUrl"
    q-carousel-slide(
      v-for="(i,ii) in node.items" :key="i.id"
      :name="i.id"
      :style=`{
        padding: 0,
        margin: 0
      }`)
      edit-item(:item="i" :itemIndex="ii"
      @itemAdd="")
  div().row.full-width
    edit-item(:item="node.items[0]" :itemIndex="0")
</template>

<script>
import editItem from './edit_item.vue'

export default {
  name: 'wsNodeEditor__editItems',
  components: {editItem},
  props: ['node'],
  data () {
    return {
      slide: null
    }
  },
  watch: {
    node: {
      immediate: true,
      handler (to, from) {
        this.slide = to.items[0].id
      }
    }
  },
  methods: {
    itemAdd () {
      this.$log('itemAdd')
    }
  }
}
</script>
