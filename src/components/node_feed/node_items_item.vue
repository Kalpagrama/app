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
      //- context and name
      div(
        :style=`{
          position: 'absolute', zIndex: 1000, bottom: '-0.5px',
          transform: 'translate3d(0,0,0)',
          background: 'linear-gradient(0deg, rgba(15,15,15,0.9) 0%, rgba(0,0,0,0) 100%)',
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.justify-between
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          q-btn(
            v-if="itemActive && item.type === 'NODE'"
            round flat dense color="white" icon="select_all")
        .col
          router-link(
            v-if="item.type === 'NODE'"
            :to="'/node/'+item.oid"
            :style=`{minHeight: '36px',}`
            ).row.full-width.items-center.content-center.justify-center.cursor-pointer
            span.text-white {{ item.name }}
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          q-btn(
            v-if="itemActive"
            round flat dense color="white" icon="link")
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
