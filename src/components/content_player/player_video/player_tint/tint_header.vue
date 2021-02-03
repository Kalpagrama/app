<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 1000,
    left: '0px', top: '0px',
    background: isFocused ? 'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)' : 'none',
    borderRadius: '10px 10px 0 0',
  }`
  ).row.full-width.items-center.content-center.q-pa-xs
  .col
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      q-btn(
        v-if="true"
        @click="contentClick"
        flat color="white" no-caps dense
        align="left" icon="select_all"
        :to="contentLink"
        :style=`{
          height: '44px',
          overflow: 'hidden',
          maxWidth: 'calc(100% - 16px)',
        }`).q-pl-xs
        .col
          span(:style=`{whiteSpace: 'nowrap'}`).q-mx-sm {{ contentKalpa.name }}
  //- volume
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    q-btn(
      v-if="player.muted ? true : isFocused"
      @click="player.setState('muted', !player.muted)"
      round flat color="white"
      :icon="player.muted ? 'volume_off' : 'volume_up'")
</template>

<script>
export default {
  name: 'tintHeader',
  props: ['player', 'contentKalpa', 'options', 'isFocused'],
  computed: {
    contentLink () {
      return '/content/' + this.contentKalpa.oid
    }
  },
  methods: {
    contentClick () {
      this.$log('contentClick')
      if (this.options.nodeOid) {
        this.$store.commit('ui/stateSet', ['nodeOnContent', this.options.nodeOid])
      }
    },
  }
}
</script>
