<template lang="pug">
q-btn(
  flat dense color="green" no-caps @click="start()")
  q-dialog(v-model="opened" position="bottom")
    .column.full-width
</template>

<script>
export default {
  name: 'layerMover',
  props: ['composition', 'layersSelected'],
  inject: ['sidPlayer', 'sidEditor'],
  data () {
    return {
      opened: false,
    }
  },
  computed: {
    storeEditor () {
      return window.stores[this.sidEditor]
    },
    storePlayer () {
      return window.stores[this.sidPlayer]
    },
  },
  methods: {
    start () {
      this.$log('start')
    }
  }
}
</script>
