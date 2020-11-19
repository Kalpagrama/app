<template lang="pug">
div(
  :style=`{position: 'relative',}`
  ).row.full-width
  div(
    v-if="!isActiveLocal"
    @click="isActiveLocal = true, $emit('activated')"
    :style=`{
      position: 'absolute', zIndex: 100,
      //- opacity: 0.5,
    }`
    ).row.fit
  node-mini(
    v-if="item.type === 'NODE'"
    :isActive="isActiveLocal" :isVisible="isVisible"
    :node="item"
    :marginBottom="80")
  //- user
  //- sphere
  div(
    v-if="item.type === 'WORD'"
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
      marginTop: '50px',
      marginBottom: '30px',
    }`
    ).row.full-width.q-pa-sm.b-40
    span.text-white.q-ml-sm {{ item.name }}
  //- content
  div(
    v-if="item && ['VIDEO', 'IMAGE'].includes(item.type)"
    @click="$router.push(`/content/${item.oid}`)"
    :style=`{
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
    }`
    ).row.full-width.items-start.content-start.cursor-pointer
    img(
      draggable="false"
      :src="itemThumburl"
      :style=`{
        borderRadius: '10px',
      }`
      ).full-width
    div(
      :style=`{
        height: '60px',
      }`
      ).row.full-width
      div(:style=`{width: '60px',}`).row.full-height.items-center.content-center.justify-center
        q-icon(name="select_all" color="white" size="20px")
      .col
        div(
          v-if="showName"
          ).row.fit.items-center.content-center
          span.text-white {{ item.name }}
  //- content,ws, bookmarkws
  .row.full-width
    slot(name="footer")
</template>

<script>
export default {
  name: 'jointItem',
  props: ['item', 'isActive', 'isVisible'],
  data () {
    return {
      isActiveLocal: false
    }
  },
  computed: {
    itemThumburl () {
      if (this.item.type === 'IMAGE') {
        return this.item.urlOriginal
      }
      else {
        return this.item.thumbUrl
      }
    },
    showName () {
      if (this.item.type === 'IMAGE') {
        return false
      }
      else {
        return true
      }
    }
  },
  watch: {
    isActive: {
      immediate: true,
      handler (to, from) {
        this.$log('isActive TO', to)
        this.isActiveLocal = to
      }
    }
  }
}
</script>
