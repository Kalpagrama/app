<template lang="pug">
.row.full-width.items-start.content-start
  div(
    :style=`{
      background: 'rgb(35,35,35)',
      borderRadius: '10px', overflow: 'hidden',
    }`).row.full-width
    //- header: author, createdAt
    .row.full-width.items-center.content-center.q-pa-sm
      q-btn(
        :to="'/user/'+node.author.oid"
        flat color="white" dense no-caps
        )
        user-avatar(:url="node.author.thumbUrl" :width="24" :height="24")
        span.text-grey-4.q-ml-sm {{ node.author.name }}
      .col
      small.text-grey-8.q-mr-xs 11922
      q-icon(name="visibility" color="grey-8").q-mr-md
      .text-grey-8.q-mr-sm {{ $date(node.createdAt, 'DD.MM.YYYY') }}
    //- items wrapper
    .row.full-width
      //- SLIDER
      div(
        v-if="node.layout === 'SLIDER'"
        :style=`{
          position: 'relative',
          borderRadius: '10px', overflow: 'hidden',
        }`).row.full-width.items-start.content-start
        list-slider(:items="node.items")
          template(v-slot:item=`{item, isActive: itemActive}`)
            div(
              :style=`{
                borderRadius: '10px', overflow: 'hidden',
              }`
              ).row.fit.b-40.shadow-5
              img(
                :src="item.thumbUrl"
                :style=`{
                  objectFit: 'cover',
                }`
                ).fit
      //- PIP, VERTICAL
      div(
        v-if="['PIP', 'VERTICAL'].includes(node.layout)"
        :style=`{
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.full-width.items-start.content-start
        img(
          :src="node.items[0].thumbUrl"
          :style=`{
            objectFit: 'contain'
          }`
          ).full-width
    //- essence
    .row.full-width.justify-center.cursor-pointer.q-pa-md
      span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ node.name }}
</template>

<script>
export default {
  name: 'nodeFeed',
  props: ['node', 'isActive', 'isVisible'],
  data () {
    return {
    }
  }
}
</script>
