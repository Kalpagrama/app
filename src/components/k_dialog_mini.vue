<template lang="pug">
div(@click.self="$emit('hide')").row.fit.items-end
  //- v-touch-pan:down.up.prevent.mouse="handlePan"
  div(
    :style=`{
      maxHeight: $q.screen.height-delta+'px',
      borderRadius: '10px 10px 0 0',
      overflow: 'hidden'}`).row.fit
    slot
</template>

<script>
export default {
  name: 'kDialogMini',
  data () {
    return {
      delta: 200
    }
  },
  methods: {
    handlePan (e) {
      this.$log('handlePan', e)
      this.delta += e.delta.y
    }
  }
}
</script>
