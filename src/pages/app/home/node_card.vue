<template lang="pug">
div(:style=`{height: $store.state.ui.width+160+'px', maxWidth: $store.state.ui.width+'px'}`
  ).column.full-width.q-mt-xs.q-mb-sm.bg-white
  //- header
  div(style=`height: 60px`).row.full-width.items-center.q-pl-xs
    div(style=`height: 60px; width: 50px`).row.items-center.justify-center
      div(style=`height: 35px; width: 35px; borderRadius: 50%`).row.bg-primary
    .col
      .row.fit.content-center
        .row.full-width
          span.text-bold Иван Мотовилов
        .row.full-width
          small.text-grey-5 from Youtube 10m 107.4 views
    div(style=`height: 60px; width: 50px`).row.items-center
      q-btn(flat round dense icon="bookmark_outline" size="17px")
  //- core
  div(:style=`{height: $store.state.ui.width+'px'}`).row.full-width.q-pa-md
    div(style=`border: 3px solid #eee; borderRadius: 8px; overflow: hidden`).column.fit.bg
      .col
        //- TODO: placeholder for image and check for existance
        img(:src="item.thumbUrl[0]" width="100%" height="100%")
      div(style=`height: 50px;`).row.full-width.justify-center.items-center.q-px-sm
        span.text-center {{ item.name }}
      .col.full-width
        img(:src="item.thumbUrl[1]" width="100%" height="100%")
  div(style=`height: 50px`).row.full-width.q-px-sm
    div(style=`height: 50px; maxWidth: 100%`).row.full-width.items-center.bg-white.no-wrap.scroll
      div(v-for="(t, ti) in tags" :key="t.oid" style=`height: 30px; borderRadius: 5px`).q-pa-xs.q-mr-sm.bg-grey-2
        span #
        span {{ t.name }}
  //- like, repost, share
  div(style=`height: 50px`).row.full-width.items-center.justify-between.q-px-md
    div.row.full-height.items-center
      q-btn(icon="thumb_up" flat round dense)
      small 2.4k
    div.row.full-height.items-center
      q-btn(icon="redo" flat round dense)
      small 431
    div.row.full-height.items-center
      q-btn(icon="share" flat round dense)
      small Share
    div.row.full-height.items-center
      q-btn(flat round dense icon="more_vert")
</template>

<script>
export default {
  name: 'nodeCard',
  props: {
    item: {type: Object, required: true}
  },
  data () {
    return {
      tags: [
        {oid: 't1', name: 'смерть'},
        {oid: 't2', name: 'сталин'},
        {oid: 't3', name: 'справедливость'},
        {oid: 't4', name: 'неприкосновенность'}
      ]
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
