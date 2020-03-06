<template lang="pug">
q-layout.bg-grey-10
  //- q-page-container
  //-   .column
  //-     div(:style=`{height: 400+'px'}`).row.full-width.content-center
  //-       k-spinner(:width="100" :height="100" @click.native="$router.push('/login')")
  //-       .row.full-width.justify-center.q-mt-sm
  //-         span.text-h6.text-white.text-bold KALPAGRAMMA
  //- q-footer(style=`height: 50%`)
    //- email
  q-page-container
    div(:style=`{height: '200px'}`).row.full-width.content-center.items-center
      kalpa-spinner(:width="100" :height="100")
      .row.full-width.justify-center.q-mt-sm
        span.text-h6.text-white Kalpa
    router-view
</template>

<script>

export default {
  name: 'loginLayout',
  components: {},
  data () {
    return {
    }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
