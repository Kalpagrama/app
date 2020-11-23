<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: options.height,
    }`
  ).row.full-width.items-start.content-start
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    content-explorer(
      v-if="isActive"
      :composition="composition"
      :options="options")
  //- preview
  img(
    @click="$emit('previewClick')"
    :src="composition.thumbUrl"
    draggable="false"
    :style=`{
      //- maxHeight: $q.screen.height/2+'px',
      maxHeight: maxHeight+'px',
      background: 'rgb(35,35,35)',
      borderRadius: '10px', overflow: 'hidden',
      userSelect: 'none',
      //- height: options.height,
      //- height: '100%',
      //- objectFit: options.objectFit,
      objectFit: 'cover',
    }`
    ).full-width
</template>

<script>

export default {
  name: 'compositionPlayer_playerImage',
  components: {
    contentExplorer: () => import('../content_explorer.vue')
  },
  props: {
    isVisible: {type: Boolean},
    isActive: {type: Boolean},
    composition: {type: Object, required: true},
    options: {
      type: Object,
      default () {
        return {
          height: 'auto',
          objectFit: 'cover',
          loop: true,
        }
      }
    }
  },
  computed: {
    maxHeight () {
      if (this.$q.screen.width > this.$store.state.ui.pageWidth) return this.$store.state.ui.pageWidth
      else {
        return this.$q.screen.width
      }
    }
  }
}
</script>
