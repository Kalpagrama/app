<template lang="pug">
div(
  :style=`{
    position: 'relative',
    transform: itemIndex === 0 ? 'perspective(600px) rotateY(6deg)' : 'perspective(600px) rotateY(-6deg)',
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
          //- bottom: '-0.5px',
          top: '-0.5px',
          minHeight: '40px',
          transform: 'translate3d(0,0,0)',
          //- background: 'linear-gradient(0deg, rgba(15,15,15,0.9) 0%, rgba(0,0,0,0) 100%)',
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.justify-between.q-px-xs
        //- transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        q-btn(
          v-if="item.type === 'NODE' || item.__typename === 'Composition'"
          :to="itemContextLink"
          round flat dense color="grey-5" icon="select_all")
        .col
          router-link(
            v-if="true"
            :to="itemLink"
            :style=`{minHeight: '36px',}`
            ).row.full-width.items-center.content-center.justify-center.cursor-pointer
            span.text-grey-2 {{ item.name }}
        //- transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        q-btn(
          v-if="true"
          :to="itemLinksLink"
          round flat dense color="grey-5" icon="link")
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
        return '/content/' + this.item.layers[0].contentOid + '?node=' + this.oid
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
