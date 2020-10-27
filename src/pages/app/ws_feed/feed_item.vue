<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-start.content-start
  slot(name="tint" :item="item")
  div(
    v-if="item"
    @click="$emit('clicked', item)"
    :style=`{
      height: '80px',
      borderRadius: '10px',
      background: 'rgb(35,35,35)',
    }`
    ).row.full-width.items-start.content-start
    img(
      draggable="false"
      :src="item.thumbUrl"
      :style=`{
        width: '80px', height: '80px',
        borderRadius: '10px',
        objectFit: 'cover',
      }`
      )
    .col.full-height
      .row.fit.items-center.content-center.q-pa-sm
        span.text-white {{ item.name }}
  //- small.text-white {{ item }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'feedItem',
  props: ['item'],
  data () {
    return {
    }
  }
}
</script>
