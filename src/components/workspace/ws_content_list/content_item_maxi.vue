<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden',
    maxHeight: '200px',
  }`
  ).row.full-width.items-center.content-center.q-mb-sm.b-60.content-item
  img(
    v-if="!thumbErrored"
    @error="thumbErrorHandle"
    :src="content.thumbOid"
    :style=`{objectFit: 'cover'}`).fit
  div(
    v-if="thumbErrored"
    :style=`{height: '150px'}`
    ).row.full-width.items-center.content-center.justify-center.b-70
    q-icon(
        v-if="thumbErrored"
        name="photo" color="grey-8" size="150px")
  q-btn(
    round flat dense color="grey-6" icon="more_vert"
    :style=`{position: 'absolute', top: '8px', right: '8px', zIndex: 1000, background: 'rgba(0,0,0,0.3)'}`)
  span(
    :style=`{
      position: 'absolute', zIndex: 1000, left: '8px',
      maxWidth: 'calc(100% - 16px)',
      bottom: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)'}`
    ).q-pa-sm.text-white {{contentName}}
</template>

<script>
export default {
  name: 'contentItemMaxi',
  props: ['content'],
  data () {
    return {
      thumbErrored: false
    }
  },
  computed: {
    contentName () {
      return this.content.name
    }
  },
  methods: {
    thumbErrorHandle () {
      // this.$log('thumbErrorHandle')
      this.thumbErrored = true
    }
  }
}
</script>
