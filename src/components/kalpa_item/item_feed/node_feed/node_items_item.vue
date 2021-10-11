<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '12px',
    ...styles,
  }`
  ).row.full-width
  slot
  //- NODE
  //- composition(
    v-if="item && item.type === 'NODE'"
    :composition="item.items[0]"
    :isActive="itemActive"
    :isVisible="true"
    :isMini="!itemOpened"
    :options=`{
      footerOverlay: true,
      showHeader: true,
      showFooter: false,
      mode: 'feed',
    }`
    :styles="styles")
  item-feed(
    v-if="item && item.type === 'NODE'"
    :itemShortOrFull="item"
    :isVisible="itemActive"
    :isActive="itemActive"
    :showHeader="itemOpened"
    :showName="itemOpened"
    :showActions="itemOpened"
    :showSpheres="itemOpened"
    :styles="styles"
    :style=`{
      borderRadius: '10px',
    }`).b-30
    template(v-slot:items)
      composition(
        v-if="item && item.type === 'NODE'"
        :composition="item.items[0]"
        :isActive="itemActive"
        :isVisible="true"
        :isMini="!itemOpened"
        :options=`{
          footerOverlay: true,
          showHeader: true,
          showFooter: false,
          mode: 'feed',
          nodeOid: item.oid,
        }`
        :styles="styles")
    template(v-slot:wrapper)
      div(
        @click="$emit('open')"
        v-if="itemOpenedHandle"
        v-show="!itemOpened"
        :style=`{
          position: 'absolute', zIndex: 300, bottom: '-0.8px',
          //- background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)',
          borderRadius: '0 0 10px 10px',
          minHeight: '30%',
          //- opacity: 0.5,
        }`
        ).row.full-width.justify-center.cursor-pointer
  //- COMPOSITION
  composition(
    v-else-if="item && item.type === 'COMPOSITION'"
    :composition="item"
    :isActive="itemActive"
    :isVisible="true"
    :isMini="!itemOpened"
    :styles="styles"
    :options=`{
      loop: true,
      showBar: false,
      footerOverlay: true,
      mode: 'feed',
      nodeOid: oid,
    }`)
  div(
    v-else-if="item.__typename === 'Sphere'"
    :style=`{
      borderRadius: '10px',
    }`
    ).row.fit.items-center.content-center.justify-center.b-30
    q-icon(name="blur_on" color="white" size="100px")
  //- CONTENT, USER, SPHERE, GIF ?, joint ?
  //- FALLBACK
  //- fallback image
  img(
    v-else-if="item"
    :src="url"
    :style=`{
      borderRadius: '10px',
      borderRadius: '10px',
      objectFit: 'cover',
    }`
    ).fit.b-30
  //- itemMeta
  router-link(
    v-if="itemMeta"
    v-show="!itemOpened"
    ref="item-meta"
    :to="itemMeta.link"
    :style=`{
      position: 'absolute', zIndex: 200,
      bottom: '-1px', right: '0px', left: '0px',
      background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)',
      borderRadius: '0 0 10px 10px',
      minHeight: '40px',
    }`
    ).row.full-width.items-center.content-center.scroll.scroll-disable
    div(
      :class=`{
      }`
      ).row.full-width.no-wrap.items-center.content-center.justify-start
      q-icon(:name="itemMeta.icon" size="14px" color="white").q-mr-xs.q-ml-md
      small(:style=`{whiteSpace: 'nowrap'}`).text-white {{ itemMeta.name }}
</template>

<script>
import { ContentApi } from 'src/api/content'

export default {
  name: 'nodeFeed__nodeItemsItem',
  props: ['oid', 'item', 'itemIndex', 'itemActive', 'itemOpened', 'itemOpenedHandle', 'styles'],
  components: {
  },
  data () {
    return {
    }
  },
  computed: {
    url () { return ContentApi.urlSelect(this.item) },
    itemMeta () {
      // node
      if (this.item.type === 'NODE') {
        return {
          link: '/node/' + this.item.oid,
          name: this.item.name,
          icon: 'adjust'
        }
      }
      // composition
      else if (this.item.type === 'COMPOSITION') {
        // return '/content/' + this.item.layers[0].contentOid + '?node=' + this.oid
        return {
          link: '/content/' + this.item.layers[0].contentOid,
          name: this.item.layers[0].contentName || 'Источник',
          icon: 'select_all'
        }
      }
      // sphere
      else if (this.item.__typename === 'Sphere') {
        return {
          link: '/sphere/' + this.item.oid,
          name: this.item.name,
          icon: 'blur_on'
        }
      }
      // user
      else if (this.item.__typename === 'User') {
        return {
          link: '/user/' + this.item.oid,
          name: this.item.name,
          icon: 'blur_on'
        }
      }
      // content
      else if (['Video', 'Image', 'Book'].includes(this.item.__typename)) {
        return {
          link: '/content/' + this.item.oid,
          name: this.item.name || 'Источник',
          icon: 'select_all'
        }
      }
      // joint?
      // else if (this.item.type === '')
      else {
        return null
      }
    }
  }
}
</script>
