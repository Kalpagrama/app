<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px', overflow: 'hidden',
  }`
  ).row.fit.b-40.shadow-10
  //- item preview...
  img(
    :src="item.thumbUrl"
    draggable="false"
    :style=`{objectFit: item.meta.cover ? 'cover' : 'contain'}`
    ).fit
  item-player(
    v-if="item.outputType === 'VIDEO'"
    :item="item" :isActive="isActive"
    :style=`{position: 'absolute', zIndex: 50,}`)
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    q-btn(
      v-if="isActive"
      flat dense color="white" icon="more_vert"
      :style=`{
        position: 'absolute', zIndex: 1000,
        top: 'calc(50% - 20px)',
        right: '0px',
      }`
      )
      q-menu(dark anchor="center left" self="center right")
        div(:style=`{width: '120px'}`).row
          q-btn(
            @click="$emit(akey)"
            v-for="(a,akey) in actions" :key="akey"
            flat dense color="white" no-caps align="left"
            ).full-width.q-px-md {{ a.name }}
          div().row.full-width.q-px-md.q-py-xs
            q-toggle(
              v-model="item.meta.cover"
              flat dense color="green" no-caps
              label="Fit" left-label
              ).q-ml-xs
</template>

<script>
export default {
  name: 'editItem',
  props: ['item', 'isActive'],
  components: {
    itemPlayer: () => import('./item-player.vue')
  },
  data () {
    return {
    }
  },
  computed: {
    actions () {
      return {
        next: {name: 'Next'},
        prev: {name: 'Prev'},
        remove: {name: 'Remove'},
        duplicate: {name: 'Duplicate'}
      }
    }
  }
}
</script>
