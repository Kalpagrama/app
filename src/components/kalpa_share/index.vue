<template lang="pug">
.row
  q-dialog(
    v-model="showDialog"
    position="bottom"
    :maximized="$q.screen.width < 800")
    //- feeds-selector(
      :oid="oid"
      :bookmark="bookmark"
      :style=`{
        height: $q.screen.width < 800 ? $q.screen.height-60+'px' : '600px',
        maxWidth: $q.screen.width < 800 ? '100%' : '500px',
      }`
      @close="showDialog = false")
  q-btn(
    @click="start()"
    round flat no-caps
    color="grey-9"
    icon="share"
    :loading="loading")
</template>

<script>
export default {
  name: 'kalpaShare',
  props: ['item'],
  data () {
    return {
      showDialog: false,
      loading: false,
    }
  },
  methods: {
    start () {
      this.$log('start')
    }
  }
}
</script>
