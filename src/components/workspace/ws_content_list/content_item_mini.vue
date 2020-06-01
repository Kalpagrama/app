<template lang="pug">
div(
  @click.self="$emit('edit')"
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
    :style=`{width: '180px', height: '100px', borderRadius: '10px', overflow: 'hidden'}`
    ).row.items-center.content-center.justify-center.b-80
    img(
      v-if="!thumbErrored"
      @error="thumbErrorHandle"
      :src="content.thumbOid"
      :style=`{objectFit: 'cover'}`).fit
    q-icon(
      v-if="thumbErrored"
      name="photo" color="grey-8" size="150px")
  //- center name
  div(:style=`{position: 'relative'}`).col.full-height
    .row.fit.items-start.content-start.q-pa-sm
      span(:style=`{userSelect: 'none'}`).text-white {{ contentName }}
      //- stats
      q-btn(
        v-if="content.layers.length > 0"
        flat dense color="grey-4"
        icon="layers"
        :style=`{
          position: 'absolute', left: '8px', bottom: '8px', zIndex: 1000,
        }`
        ).b-70
        span.q-ml-sm.q-mr-xs {{content.layers.length}}
  //- right
  div(:style=`{width: '40px'}`).row.full-height.items-start.content-start.q-pt-sm
    q-btn(round flat dense color="grey-6" icon="more_vert")
      q-menu(cover auto-close anchor="top right")
        div(:style=`{minWidth: '150px', maxWidth: '150px'}`).column.fit.b-70
          .col.full-width
            q-btn(
              v-for="(a,aId) in contentActions" :key="aId"
              @click="a.fn()"
              flat no-caps color="white" align="left"
              ).full-width {{a.name}}
</template>

<script>
export default {
  name: 'contentItemMini',
  props: ['content'],
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
    contentActions () {
      return {
        edit: {
          name: 'Edit',
          fn: () => {
          }
        },
        explore: {
          name: 'Explore',
          fn: () => {
          }
        },
        delete: {
          name: 'Delete',
          fn: async () => {
            if (!confirm('Delete content?')) return
            await this.$rxdb.remove(this.content.id)
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
