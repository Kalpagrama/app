<template lang="pug">
q-layout.bg-primary
  //- q-page-container
  //-   .column
  //-     div(:style=`{height: 400+'px'}`).row.full-width.content-center
  //-       k-spinner(:width="100" :height="100" @click.native="$router.push('/login')")
  //-       .row.full-width.justify-center.q-mt-sm
  //-         span.text-h6.text-white.text-bold KALPAGRAMMA
  //- q-footer(style=`height: 50%`)
    //- email
  q-page-container
    div(:style=`{height: '300px'}`).row.full-width.content-center.items-center
      k-logo(:width="100" :height="100")
      .row.full-width.justify-center.q-mt-sm
        span.text-h6.text-white Kalpagramma
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
