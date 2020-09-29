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
              video(
                v-if="isActive && itemActive && item.outputType === 'VIDEO'"
                :src="item.url"
                muted autoplay playsinline loop
                :style=`{
                  position: 'absolute',
                  objectFit: 'cover',
                  borderRadius: '10px', overflow: 'hidden',
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
    router-link(
      :to="'/node/'+node.oid"
      ).row.full-width.justify-center.cursor-pointer.q-pa-md
      span(:style=`{fontSize: '18px'}`).text-white.text-bold.shaking.cursor-pointer {{ node.name }}
  //- footer
  .row.full-width.justify-center.items-center.content-center.q-px-md
    div(:style=`{maxWidth: '600px'}`).row.full-width.items-center.content-center
      small.text-grey-9 12312
      q-btn(round flat color="grey-9" icon="cached").shaking
      .col
      small.text-grey-9 12312
      q-btn(round flat color="grey-9" icon="link" @click="$router.push('/workspace/link/new')").shaking
      .col
      q-btn(round flat color="grey-9" icon="share").shaking
      .col
      q-btn(round flat color="grey-9" icon="bookmark_outline").shaking
      small.text-grey-9 12312
      .col
      q-btn(round flat color="grey-9" icon="adjust").shaking
      small.text-grey-9 12312
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
