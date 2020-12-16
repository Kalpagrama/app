<template lang="pug">
div(
  :style=`{
    borderRadius: '12px',
    ...itemStyles,
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
    :styles=`{
      height: '100%',
      objectFit: 'cover',
    }`
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
    :styles=`{
      height: '100%',
      objectFit: 'cover',
    }`
    :options=`{
      height: '100%', objectFit: 'cover', loop: true,
      showContentExplorer: true,
      showContentMeta: false,
      borderRadius: '10px',
      overflow: 'hidden'
    }`)
  div(
    v-else-if="item.__typename === 'Sphere'"
    :style=`{
      borderRadius: '10px',
    }`
    ).row.fit.items-center.content-center.justify-center.b-30
    q-icon(name="blur_on" color="white" size="100px")
    //- div(
      :style=`{
        position: 'absolute',
        textAlign: 'center'
      }`
      ).row.full-width.justify-center
      span.text-white {{ item.name }}
  //- CONTENT, USER, SPHERE, GIF ?
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
      position: 'absolute', zIndex: 1000,
      bottom: '-0.5px',
      //- top: '-0.5px',
      minHeight: '40px',
      transform: 'translate3d(0,0,0)',
      background: 'linear-gradient(0deg, rgba(15,15,15,0.9) 0%, rgba(0,0,0,0) 100%)',
      borderRadius: '10px',
    }`
    ).row.full-width.items-center.content-center.justify-between.q-px-xs
    .col
      router-link(
        v-if="true"
        :to="itemLink"
        :style=`{minHeight: '36px',}`
        ).row.full-width.items-center.content-center.justify-center.cursor-pointer
        span(v-if="item.type === 'NODE'").text-grey-2 {{ item.name }}
        span(v-if="item.__typename === 'Sphere'").text-grey-2 {{ item.name }}
        q-btn(v-if="item.__typename === 'Composition'" round flat color="white" icon="select_all")
</template>

<script>
import compositionPlayer from 'components/composition/composition_player/index.vue'

export default {
  name: 'nodeFeed__nodeItemsItem',
  props: ['oid', 'item', 'itemIndex', 'itemActive', 'itemVertex', 'itemStyles'],
  components: {
    compositionPlayer,
  },
  data () {
    return {
    }
  },
  computed: {
    itemLink () {
      // '/node/'+item.oid
      if (this.item.type === 'NODE') {
        return '/node/' + this.item.oid
      }
      else if (this.item.__typename === 'Composition') {
        return '/content/' + this.item.layers[0].contentOid + '?node=' + this.oid
      }
      // else if (this.item.type === '')
      else {
        return '//'
      }
    },
    itemContextLink () {
      if (this.item.type === 'NODE') {
        return '/content/' + this.item.items[0].layers[0].contentOid + '?node=' + this.oid
      }
      else if (this.item.__typename === 'Composition') {
        return '/content/' + this.item.layers[0].contentOid
      }
      // else if (this.item.type === '')
      else {
        return '//'
      }
    },
    itemLinksLink () {
      return '/links/' + this.item.oid
    }
  }
}
</script>
