<style lang="sass" scoped>
.feed-item
  &:hover
    background: rgb(40,40,40) !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-start.content-start
  slot(name="tint" :item="item")
  //- default
  div(
    v-if="item"
    @click="$emit('select')"
    :style=`{
      height: '80px',
      borderRadius: '10px',
      background: 'rgb(35,35,35)',
      zIndex: 10,
      position: 'relative',
    }`
    ).row.full-width.items-start.content-start.cursor-pointer.feed-item
    //- left side
    div(
      :style=`{
        width: '80px', height: '80px',
        borderRadius: '10px',
      }`
      ).row.items-center.content-center.justify-center
      img(
        v-if="item.type !== 'SPHERE'"
        draggable="false"
        :src="item.thumbUrl"
        :style=`{
          zIndex: 101,
          width: '80px', height: '80px',
          borderRadius: '10px',
          objectFit: 'cover',
        }`)
      q-icon(
        v-else
        name="blur_on" size="50px" color="white")
    //- right side
    .col.full-height
      div(
        :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`
        ).row.fit.items-center.content-center.q-pa-sm
        span(:style=`{zIndex: 102}`).text-white {{ item.name.slice(0, 50) }}
        .row.full-width
          q-icon(
            :name="itemIcon(item)" size="90px"
            :style=`{
              color: 'rgb(45,45,45)',
              position: 'absolute', zIndex: 100, top: '-5px', right: '-30px',
            }`)
  .row.full-width
    slot(name="default" :item="item")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'feedItem',
  props: ['item'],
  data () {
    return {
    }
  },
  methods: {
    itemIcon (item) {
      let itemIconMap = {
        SPHERE: 'blur_on',
        VIDEO: 'select_all',
        IMAGE: 'select_all',
        NODE: 'filter_tilt_shift',
        USER: 'face',
        JOINT: 'link'
      }
      if (itemIconMap[item.type]) {
        return itemIconMap[item.type]
      }
    },
  }
}
</script>
