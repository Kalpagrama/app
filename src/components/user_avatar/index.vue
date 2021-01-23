<template lang="pug">
div(
  :style=`{
    position: 'relative', height: height+'px', width: width+'px',
    //- margin: 0, padding: 0,
  }`
  ).row.items-center.content-center.justify-center
  img(
    v-show="!error"
    @load="loaded" @error="errored" draggable="false"
    :src="url"
    :style=`{
      opacity: opacity,
      width: '100%', height: '100%',
      margin: 0, padding: 0,
      borderRadius: '50%', overflow: 'hidden',
      userSelect: 'none'
    }`).cursor-pointer
  div(
    v-if="error"
    :style=`{width: '90%', height: '90%', borderRadius: '50%', overflow: 'hidden'}`
    ).row.items-center.content-center.justify-center.bg-grey-3.cursor-pointer
    q-icon(color="green" name="face" size="25px")
  slot()
</template>

<script>
export default {
  name: 'userAvatar',
  props: {
    url: {
      type: String
    },
    width: {
      type: Number,
      default () {
        return 60
      }
    },
    height: {
      type: Number,
      default () {
        return 60
      }
    },
    opacity: {
      type: Number,
      default () {
        return 1
      }
    }
  },
  data () {
    return {
      error: false
    }
  },
  methods: {
    loaded () {
      // this.$log('loaded')
    },
    errored () {
      this.$log('errored')
      this.error = true
    }
  }
}
</script>
