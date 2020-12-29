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
      loop: true,
      showBar: false,
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
      loop: true,
      showBar: false,
    }`)
  div(
    v-else-if="item.__typename === 'Sphere'"
    :style=`{
      borderRadius: '10px',
    }`
    ).row.fit.items-center.content-center.justify-center.b-30
    q-icon(name="blur_on" color="white" size="100px")
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
      position: 'absolute', zIndex: 200,
      //- bottom: '-0.5px',
      bottom: '34px',
      //- bottom: '0px',
      //- top: '-0.5px',
      //- minHeight: '40px',
      //- transform: 'translate3d(0,0,0)',
      //- background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)',
      //- borderRadius: '10px',
    }`
    ).row.full-width.items-center.content-center.justify-center.q-px-md
    div(
      :style=`{
        borderRadius: '10px',
        maxWidth: '100%',
      }`
      ).row.bg-black
      router-link(
        :to="itemLink"
        :style=`{
          height: '36px',
          textAlign: 'center',
        }`
        ).row.items-center.content-center.scroll
        //- .row.full-width.br
        q-btn(
          v-if="item.__typename === 'Composition'"
          round flat dense color="white" icon="select_all")
        span(
          v-else
          :style=`{
            whiteSpace: 'nowrap',
            marginLeft: '8px',
            textAlign: 'center',
          }`).text-white.q-mr-sm {{ item.name }}
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
      else if (this.item.__typename === 'Sphere') {
        return '/sphere/' + this.item.oid
      }
      else if (this.item.__typename === 'User') {
        return '/user/' + this.item.oid
      }
      else if (['Video', 'Image', 'Book'].includes(this.item.__typename)) {
        return '/content/' + this.item.oid
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
