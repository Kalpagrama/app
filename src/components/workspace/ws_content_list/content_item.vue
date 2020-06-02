<template lang="pug">
div(
  @mousenter="mouseIsOver = true"
  @mouseleave="mouseIsOver = false"
  :style=`{
    position: 'relative',
    height: '100px',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.full-width.items-center.content-center.q-mb-sm.b-60.content-item
  //- thumb
  div(
    @click="$emit('pick')"
    :style=`{width: '180px', height: '100px', borderRadius: '10px', overflow: 'hidden'}`
    ).row.items-center.content-center.justify-center.b-80
    img(
      v-if="!thumbErrored"
      @error="thumbErrorHandle"
      :src="content.thumbOid"
      :style=`{objectFit: 'cover'}`).fit
    q-icon(
      v-if="thumbErrored"
      name="photo" size="150px" :style=`{color: 'rgb(90,90,90)'}`).full-width
  //- center name
  div(
    @click="$emit('pick')"
    :style=`{position: 'relative'}`).col.full-height
    .row.fit.items-start.content-start.q-pa-sm
      span(:style=`{userSelect: 'none', lineHeight: 1.2}`).text-white.text-bold {{ contentName }}
  //- stats
  q-btn(
    v-if="content.layers.length > 0"
    flat dense color="grey-5"
    icon-right="layers"
    :style=`{
      position: 'absolute', right: '3px', bottom: '0px', zIndex: 1000,
    }`)
    small {{ content.layers.length }}
  //- right
  div(
    v-if="ctx === 'workspace'"
    :style=`{width: '36px'}`).row.full-height.items-start.content-start.q-pt-sm
    q-btn(round flat dense color="grey-6" icon="more_vert")
      kalpa-menu-popup(:actions="actions")
</template>

<script>
export default {
  name: 'contentItem',
  props: ['ctx', 'content'],
  data () {
    return {
      mouseIsOver: false,
      thumbErrored: false
    }
  },
  computed: {
    contentName () {
      return this.content.name
    },
    actions () {
      return {
        edit: {
          name: 'Edit',
          fn: () => {
            this.$emit('edit')
          }
        },
        explore: {
          name: 'Explore',
          fn: () => {
            this.$emit('explore')
          }
        },
        delete: {
          name: 'Delete',
          fn: async () => {
            this.$emit('delete')
          }
        }
      }
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
