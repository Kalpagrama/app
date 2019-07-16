<template lang="pug">
.column.fit
  div(:style=`{height: '60px'}`).row.full-width.q-px-md
    div(:style=`{borderRadius: '4px'}`).row.fit.bg-white
      .col.full-height
        .row.fit.items-center.q-px-md
          span {{ $store.state.auth.user.name | cut(40) }}
      div(style=`height: 60px; width: 60px`).row.items-center.justify-center
        q-btn(round flat icon="more_vert" color="grey-9")
  .row.full-width.q-px-md
    div(style=`borderRadius: 4px; overflow: hidden`).row.fit.bg-white
      //- div(style=`height: 400px`).row.full-width.bg-grey-3
      //- .row.full-width
      //-   div(v-for="n in 3" :key="n" style=`height: 70px; borderRight: 1px solid #eee`).col
      //-     span S {{n}}
  .col
    div(style=`height: 60px`).row.full-width.justify-center.items-center
      span У вас пока нет никаких уведомлений
</template>

<script>
export default {
  name: 'pageApp__Account',
  data () {
    return {
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
