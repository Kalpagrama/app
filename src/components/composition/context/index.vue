<template lang="pug">
.row.full-width
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="isActive"
      transition-show="jump-down"
      :style=`{
        background: 'rgb(0,0,0)',
        borderRadius: '10px',
        paddingLeft: '14px',
      }`
      @click="miniClick"
      ).row.full-width.items-center.content-center.q-py-xs
      q-icon(name="select_all" color="white" size="14px").q-mr-xs
      small.text-white {{composition.layers[0].contentName}}
</template>

<script>
export default {
  name: 'context',
  props: ['composition', 'isActive', 'isVisible'],
  methods: {
    miniClick () {
      this.$router.push('/content/' + this.composition.layers[0].contentOid)
    }
  }
}
</script>
