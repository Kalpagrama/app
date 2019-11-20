<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  .col.scroll
    .row.full-width.q-px-sm
      input(style=`display: none` ref="fileinput" type="file")
      q-btn(
        icon="attachment" color="primary" no-caps @click="$refs.fileinput.click()"
        style=`height: 60px; borderRadius: 10px; overflow: hidden`).full-width.q-my-xl
        span.text-white.text-bold.q-ml-sm Выбрать файл
    //- div(body-scroll-lock-ignore).col.scroll
    //-   .row.full-width.items-start.content-start
    //-     div(
    //-       v-for="(i, ii) in 100" :key="ii"
    //-       :style=`{height: '70px'}`).row.full-width
    //-       span {{i}}
</template>

<script>
export default {
  name: 'contentFinder__sourceDevice',
  props: ['source', 'progress'],
  data () {
    return {
    }
  },
  methods: {
    async uploadFile (file, length) {
      this.$log('uploadFile')
      // let {data: {uploadContentFile: {oid}}} = await this.$apollo.mutate({
      //   client: 'uploadApollo',
      //   mutation: gql`
      //     mutation uploadContentFile ($file: Upload!, $length: Float!) {
      //       uploadContentFile (file: $file, length: $length) { oid }
      //     }
      //   `,
      //   variables: {
      //     file: file,
      //     length: length
      //   }
      // })
      // return oid
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
