<style lang="sass" scoped>
.node-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
.row.full-width.items-start.content-start
  div(
    :style=`{
      position: 'relative', zIndex: 100,
      borderRadius: '10px', overflow: 'hidden',
    }`
    ).row.full-width.b-40.node-item.q-px-md.q-pt-md
    div(
      @click="$emit('clicked')"
      :style=`{
        position: 'relative', zIndex: 100,
        height: 0, paddingBottom: '100%',
        borderRadius: '10px', overflow: 'hidden',
      }`
      ).full-width
      div(:style=`{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,}`).row
        slot(name="leftright")
        //- 0 items
        div(v-if="node.items.length === 0").row.fit.items-center.content-center.justify-center
          small.text-white {{node.name}}
        //- 1 item
        div(v-if="node.items.length === 1").row.fit.items-start.content-start
          img(:src="node.items[0].thumbUrl" draggable="false" :style=`{objectFit: 'cover'}`).fit
        //- 2 items
        div(v-if="node.items.length === 2").row.fit
          div(:style=`{borderRight: '1px solid rgb(50,50,50)'}`).col.full-height
            img(:src="node.items[0].thumbUrl" draggable="false" :style=`{objectFit: 'cover'}`).fit
          .col.full-height
            img(:src="node.items[1].thumbUrl" draggable="false" :style=`{objectFit: 'cover'}`).fit
        //- 3 items
        div(v-if="node.items.length === 3").row.fit
          .col.full-height
            img(:src="node.items[0].thumbUrl" draggable="false" :style=`{objectFit: 'cover'}`).fit
          .col.full-height
            .column.fit
              .col-full-width
                img(:src="node.items[1].thumbUrl" draggable="false" :style=`{objectFit: 'cover'}`).fit
              .col-full-width
                img(:src="node.items[2].thumbUrl" draggable="false" :style=`{objectFit: 'cover'}`).fit
        //- 4 items
        div(v-if="node.items.length === 4").row.fit
          .col.full-height
            .column.fit
              .col-full-width
                img(:src="node.items[0].thumbUrl" draggable="false" :style=`{objectFit: 'cover'}`).fit
              .col-full-width
                img(:src="node.items[1].thumbUrl" draggable="false" :style=`{objectFit: 'cover'}`).fit
          .col.full-height
            .column.fit
              .col-full-width
                img(:src="node.items[2].thumbUrl" draggable="false" :style=`{objectFit: 'cover'}`).fit
              .col-full-width
                img(:src="node.items[3].thumbUrl" draggable="false" :style=`{objectFit: 'cover'}`).fit
    //- essense
    div(
      v-if="node.items.length > 0"
      ).row.full-width.q-py-xs.q-px-md
      small.text-white {{ node.name }}
  slot(name="footer")
</template>

<script>
export default {
  name: 'wsNodeItem',
  props: ['node'],
  data () {
    return {
    }
  }
}
</script>
