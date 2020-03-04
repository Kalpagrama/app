<template lang="pug">
div(:style=`{height: height+'px', width: width+'px'}`).row.items-center.justify-center
  img(
    v-show="!error"
    @load="loaded" @error="errored" draggable="false"
    :src="url"
    :style=`{width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', userSelect: 'none'}`).cursor-pointer
  div(
    v-if="error"
    :style=`{width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden'}`
    ).row.items-center.content-center.justify-center.bg-grey-3.cursor-pointer
    q-icon(color="green" name="face" size="25px")
</template>

<script>
export default {
  name: 'kalpaAvatar',
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
    }
  },
  data () {
    return {
      error: false
    }
  },
  methods: {
    loaded () {
      this.$log('loaded')
    },
    errored () {
      this.$log('errored')
      this.error = true
    }
  }
}
</script>
