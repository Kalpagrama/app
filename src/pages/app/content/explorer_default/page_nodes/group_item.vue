<style lang="sass">
.item
  cursor: pointer
  &:hover
    background: rgb(35,35,35)
</style>

<template lang="pug">
.row.full-width.q-px-md
  q-dialog(
    v-model="isOpened")
    node-feed(
      :isActive="true"
      :isVisible="true"
      :node="item"
      :style=`{
        background: 'rgba(30,30,30,0.5)',
        borderRadius: '10px',
      }`)
  div(
    :style=`{
      background: isSelected ? 'rgb(30,30,30)' : 'none',
      borderRadius: '10px',
    }`
    ).row.full-width
    div(
      @click="itemClick"
      :style=`{
        borderRadius: '10px',
      }`
      ).row.full-width.item
      img(
        v-if="itemComposition"
        draggable="false"
        :src="itemComposition.thumbUrl"
        :style=`{
          height: '40px',
          borderRadius: '10px',
        }`)
      .col.q-pl-sm
        .row.full-width.items-center.content-center.q-pb-xs
          .row.full-width
            span.text-white {{ itemName }}
          //- figure info
          div(v-if="itemFigure && contentKalpa.type === 'VIDEO'").row.full-width
            small.text-grey-6.q-mr-xs {{ $time(itemFigure[0].t) }}
    //- selected
    div(
      v-if="isSelected"
      :style=`{}`
      ).row.full-width.q-pa-xs
      q-btn(
        v-if="contentKalpa.type === 'VIDEO'"
        @click="itemReplay()"
        round flat dense color="white" icon="replay")
      .col
      q-btn(
        @click="$emit('set-current')"
        outline dense color="white" no-caps) Cut here
      q-btn(
        @click="itemOpen()"
        round flat dense color="white" icon="launch")
</template>

<script>
export default {
  name: 'groupItem',
  props: ['player', 'contentKalpa', 'item', 'isSelected'],
  data () {
    return {
      // isSelected: false,
      isOpened: false,
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
    itemOpen () {
      this.$log('itemOpen')
      if (this.contentKalpa.type === 'VIDEO') {
        this.player.pause()
      }
      this.isOpened = true
    },
    itemReplay () {
      this.$log('itemrReplay')
      if (this.contentKalpa.type === 'VIDEO') {
        this.player.setCurrentTime(this.itemFigure[0].t)
        this.player.play()
      }
    },
    itemClick () {
      this.$log('itemClick')
      // this.isSelected = !this.isSelected
      this.$emit('set-selected')
      if (this.itemFigure) {
        if (this.contentKalpa.type === 'VIDEO') {
          this.player.setCurrentTime(this.itemFigure[0].t)
        }
      }
    }
  }
}
</script>
