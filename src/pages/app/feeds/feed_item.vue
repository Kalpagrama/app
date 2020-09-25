<template lang="pug">
.row.full-width
  div(
    :style=`{
      //- background: 'rgb(35,35,35)',
      borderRadius: '10px', overflow: 'hidden'
    }`
    ).row.full-width
    //- event reason and subject
    //- div(:styl)
    div(
      :style=`{
        background: 'rgb(35,35,35)',
        marginBottom: '-10px',
        paddingBottom: '14px',
      }`
      ).row.full-width.q-pt-xs.q-px-sm
      //- .col
      small.text-grey-6.q-mr-sm {{ item.type }}
      small.text-grey-6.q-mr-sm subject: {{ item.subject.name }}
      small.text-grey-6.q-mr-sm why: {{ item.matter.reason }}
      //- small.text-grey-6 to: {{ item.object.name }}
    //- event object : node wrapper
    div(:style=`{borderRadius: '10px',overflow: 'hidden'}`).row.full-width
      node-lite(
        v-if="item.object.type === 'NODE'"
        :node="item.object.metaStatic" :isActive="isActive" :isVisible="isVisible"
        :marginBottom="0")
      div(
        v-else-if="item.object.type === 'WORD'"
        ).row.full-width.items-center.content-center.q-pa-md
        q-icon(name="blur_on" color="white" size="30px").q-mr-sm
        span.text-bold.text-white {{ item.object.name }}
      div(
        v-else-if="item.object.type === 'JOINT'"
        ).row.full-width
        //- node-node
        div(v-if="item.object.metaStatic.leftItem.type === 'NODE' && item.object.metaStatic.rightItem.type === 'NODE'"
          ).row.full-width
          div(:style=`{height: '200px'}`).col
            img(
              :src="item.object.metaStatic.leftItem.metaStatic.items[0].thumbUrl"
              :style=`{
                objectFit: 'cover',
                borderRadius: '10px', overflow: 'hidden'}`).fit
          div(:style=`{height: '200px'}`).col
            img(
              :src="item.object.metaStatic.rightItem.metaStatic.items[0].thumbUrl"
              :style=`{
                objectFit: 'cover',
                borderRadius: '10px', overflow: 'hidden'}`).fit
        //- node-sphere
        div(v-else-if="item.object.metaStatic.leftItem.type === 'NODE' && item.object.metaStatic.rightItem.type === 'WORD'"
          ).row.full-width
          div(:style=`{height: '200px'}`).col
            img(
              :src="item.object.metaStatic.leftItem.metaStatic.items[0].thumbUrl"
              :style=`{
                objectFit: 'cover',
                borderRadius: '10px', overflow: 'hidden'}`).fit
          div(:style=`{height: '200px'}`).col
            .row.fit.items-center.content-center.justify-center.b-40
              span(:style=`{fontSize: '20px'}`).text-white {{ item.object.metaStatic.rightItem.name }}
          //- .row.full-width.q-pa-sm.b-40.br
        //- node-user
        //- node-content
        div(v-else).row.full-width
          small.text-white {{item.object}}
      div(v-else).row.full-width
        //- small.text-white {{item.object}}
        h1.text-white {{item.object.type}}
      //- small(v-if="item.object.type === 'NODE'").text-white {{item.object.metaStatic}}
</template>

<script>
export default {
  name: 'feedItem',
  props: ['item', 'isActive', 'isVisible'],
  data () {
    return {
    }
  }
}
</script>
