<template lang="pug">
div(
  :style=`{
    position: 'relative',
    transform: itemIndex === 0 ? 'perspective(600px) rotateY(10deg)' : 'perspective(600px) rotateY(-10deg)',
    borderRadius: '10px',
    ...itemStyles,
    //- overflow: 'hidden',
  }`
  ).row.full-width
  div(
    v-if="true"
    :style=`{
      position: 'relative',
      paddingTop: '100%',
    }`).row.full-width
    div(
      :style=`{
        position: 'absolute', zIndex: 100, top: 0,
      }`
      ).row.fit
      slot
      //- NODE
      composition-player(
        v-if="item && item.type === 'NODE'"
        :oid="oid"
        :composition="item.items[0]"
        :isActive="itemActive"
        :isVisible="true"
        :options=`{
          height: '100%', objectFit: 'cover', loop: true,
          showContentExplorer: true,
          showContentMeta: false,
        }`)
      //- COMPOSITION
      composition-player(
        v-else-if="item && item.__typename === 'Composition'"
        :oid="oid"
        :composition="item"
        :isActive="itemActive"
        :isVisible="true"
        :options=`{
          height: '100%', objectFit: 'cover', loop: true,
          showContentExplorer: true,
          showContentMeta: false,
          borderRadius: '10px',
          overflow: 'hidden'
        }`)
      //- FALLBACK
      //- fallback image
      img(
        v-else-if="item"
        :src="item.thumbUrl"
        :style=`{
          borderRadius: '10px',
          objectFit: 'cover',
          borderRadius: '10px',
        }`
        ).fit.b-30
      //- tint
      div(
        v-if="item && item.type === 'NODE'"
        :style=`{
          position: 'absolute', bottom: '-1px', zIndex: 2000, transform: 'translate3d(0,0,0)', height: '40%',
          //- background: 'rgb(0,0,0)',
          left: '-1px', minWidth: 'calc(100% + 2px)',
          background: 'linear-gradient(0deg, rgba(15,15,15,0.9) 0%, rgba(0,0,0,0) 100%)',
          borderRadius: '0 0 10px 10px', overflow: 'hidden', pointerEvents: 'none',
        }`).row.full-width
      //- name
      div(
        v-if="item && item.type === 'NODE'"
        @click="$router.push('/node/'+item.oid)"
        :style=`{
          position: 'absolute', zIndex: 2010, bottom: 0
        }`
        ).row.full-width.q-pa-sm.cursor-pointer
        .row.full-width.justify-center.scroll
          div(
            :style=`{
              maxHeight: '40px',
            }`
            ).row.no-wrap
            span(:style=`{whiteSpace: 'nowrap'}`).text-white.text-bold {{ item.name }}
  //- VERTEX
  //- item.type
  //- div(
    v-if="itemVertex && itemVertex !== 'ASSOCIATIVE' && itemVertex !== 'ESSENCE'"
    :class=`{
      'justify-end': itemIndex === 0
    }`
    ).row.full-width.q-px-sm.q-pt-xs
    span.text-white {{ $nodeItemType(itemVertex).name }}
</template>

<script>
import compositionPlayer from 'components/composition/composition_player/index.vue'

export default {
  name: 'nodeItems_item',
  props: ['oid', 'item', 'itemIndex', 'itemActive', 'itemVertex', 'itemStyles'],
  components: {
    compositionPlayer,
  },
  data () {
    return {
    }
  }
}
</script>
