<template lang="pug">
//- .row.full-width.items-start.content-start
  //- small.text-white {{ node }}
  .row.full-width.items-center.content-center.q-px-xs
    q-btn(
      round flat dense color="white"
      :style=`{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
      }`
      ).row.items-center.content-center.justify-center
      img(
        src="~/assets/vote.png"
        :style=`{
          width: '20px,', height: '20px',
          borderRadius: '50%',
        }`)
    .col
      .row.full-width.justify-between.q-px-xs
        router-link(:to="'/user/'+node.author.oid")
          span.text-grey-8 {{ node.author.name }}
    .row.full-height.items-center.content-center
      small.text-grey-8 {{ $date(node.createdAt) }}
      q-btn(
        round flat dense size="sm" color="grey-9" icon="more_horiz"
      ).q-ml-sm
  div(
    :style=`{
      paddingLeft: '26px',
    }`
    ).row.full-width.items-start.content-start
    div(
      :style=`{
        position: 'relative',
        background: isActive ? 'rgb(40,40,40)' : 'rgb(33,33,33)',
        borderRadius: '10px',
      }`
      ).row.full-width
      //- connection
      div(
        v-if="node.items.length === 2"
        :style=`{
          position: 'absolute', top: '50%', zIndex: 5,
          height: '1px',
        }`
        ).row.full-width.bg-grey-8
      //- 0 item
      div(
        :style=`{
          width: '50px',
        }`
        ).row.items-start.content-start
        img(
          v-if="node.items[0]"
          :src="node.items[0].thumbUrl"
          :style=`{
            height: '50px',
            width: '50px',
            borderRadius: '10px',
            objectFit: 'cover',
            zIndex: 10,
            border: figures[0] ? '3px solid rgb(76,175,79)' : 'none'
          }`)
        .row.full-width.justify-center
          small(v-if="node.items[0].layers").text-grey-8 {{ $time(node.items[0].layers[0].figuresAbsolute[0].t) }}
      //- center
      .col
        div(
          v-if="node.items.length === 1"
          ).row.fit.items-between.content-between.justify-start.q-px-sm.q-py-xs
          span.text-white {{ node.name || node.vertices }}
        div(
          v-if="node.items.length === 2"
          ).row.fit.items-center.content-center.justify-center
          span.text-white.q-mb-lg {{ name }}
      //- 1 item
      img(
        v-if="node.items[1]"
        :src="node.items[1].thumbUrl"
        :style=`{
          height: '50px',
          width: '50px',
          borderRadius: '10px',
          objectFit: 'cover',
          zIndex: 10,
          border: figures[1] ? '3px solid rgb(76,175,79)' : 'none'
        }`)
    .row.full-width.q-px-sm
      q-btn(flat dense color="grey-8" no-caps size="sm") Reply
    div(:style=`{position: 'relative',}`).row.full-width
      slot
</template>
