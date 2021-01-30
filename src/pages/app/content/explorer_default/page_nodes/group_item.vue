<style lang="sass">
.item
  cursor: pointer
  &:hover
    background: rgb(35,35,35)
</style>

<template lang="pug">
.row.full-width.q-px-md
  div(
    @click="itemClick"
    :style=`{
      borderRadius: '10px',
    }`
    ).row.full-width.q-pa-sm.item
    .row.full-width
      //- small.text-white {{ item.oid }}
      span.text-white {{ itemName }}
    //- figure info
    div(v-if="itemFigure && contentKalpa.type === 'VIDEO'").row.full-width
      small.text-grey-6.q-mr-xs {{ $time(itemFigure[0].t) }}
      //- small.text-grey-6 - {{ $time(itemFigure[1].t-itemFigure[0].t) }}
</template>

<script>
export default {
  name: 'groupItem',
  props: ['player', 'contentKalpa', 'item'],
  data () {
    return {
    }
  },
  computed: {
    itemName () {
      if (this.item.type === 'NODE') {
        return this.item.name
      }
      else if (this.item.type === 'JOINT') {
        if (this.item.vertices[0] === 'ESSENCE') return this.item.name
        else if (this.item.vertices[0] === 'ASSOCIATIVE') return 'Похожие'
        else return this.$nodeItemType(this.item.vertices[0]).name + ' - ' + this.$nodeItemType(this.item.vertices[1]).name
      }
      else {
        return ''
      }
    },
    itemComposition () {
      if (this.item.type === 'NODE') {
        return this.item.items[0]
      }
      if (this.item.type === 'JOINT') {
        let composition
        this.item.items.map(i => {
          if (i.type === 'COMPOSITION' && i.layers[0].contentOid === this.contentKalpa.oid) {
            composition = i
          }
          if (i.type === 'NODE' && i.items[0].layers[0].contentOid === this.contentKalpa.oid) {
            composition = i.items[0]
          }
        })
        return composition
      }
      else return null
    },
    itemFigure () {
      if (this.itemComposition) {
        return this.itemComposition.layers[0].figuresAbsolute
      }
      else {
        return null
      }
    }
  },
  methods: {
    itemClick () {
      this.$log('itemClick')
    }
  }
}
</script>
