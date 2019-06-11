<template lang="pug">
.row.fit
  div(style=`position: absolute; bottom: 0px; zIndex: 100; height: 60px`).row.full-width.justify-center.items-center
    q-btn(
      @click="$emit('video', {url: link}), $emit('close')"
      style=`height: 50px; width: 250px; bottom: 10px;` rounded no-caps color="primary") Выбрать видео
  iframe(
    v-if="type === 'youtube'"
    width="100%" height="100%"
    :src="getLink"
    frameborder="0"
    autoplay
    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen)
</template>

<script>
export default {
  name: 'findVideo_sourceLink',
  props: ['type', 'link'],
  data () {
    return {
    }
  },
  computed: {
    getLink () {
      let id = ''
      let arr = this.link.split('/')
      if (arr[arr.length - 2] === 'embed') {
        id = arr[arr.length - 1]
      } else {
        let s = this.link.split('=')
        id = s[1]
      }
      return `https://www.youtube.com/embed/${id}`
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
