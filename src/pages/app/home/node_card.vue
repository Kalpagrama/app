<template lang="pug">
div(:style=`{
  height: $store.state.ui.width+160+'px',
  maxWidth: $store.state.ui.width+'px'}`
  ).column.full-width.q-mt-xs.q-mb-sm.bg-white.q-px-md.bg-grey-2
  //- node author
  div(style=`height: 60px`).row.full-width.items-center
    div(style=`height: 35px; width: 35px; borderRadius: 50%`).row.bg-primary.q-ml-xs
    .col
      .row.fit.items-center.q-px-sm
        span Мотовилов Иван
  //- node body
  node(:node="node")
  //- node tags
  div(style=`order: 0; height: 50px`).row.full-width
    div(style=`height: 50px; maxWidth: 100%`).row.full-width.items-center.no-wrap.scroll
      div(v-for="(t, ti) in tags" :key="t.oid" style=`height: 30px; borderRadius: 5px`).q-pa-xs.q-mr-sm.bg-grey-3
        span #
        span {{ t.name }}
  //- node actions
  div(style=`height: 40px`).row.full-width.items-center.justify-between
    div.row.full-height.items-center
      q-btn(icon="track_changes" flat round dense)
      span.q-mb-xs 3.45
    .col
      .row.fit.items-center.justify-end
        div.row.full-height.items-center
          q-btn(icon="share" flat round dense).q-mr-md
        div.row.full-height.items-center
          q-btn(icon="more_horiz" flat round dense)
  //- //- header
  //- div(style=`height: 60px`).row.full-width.items-center.q-px-md
  //-   div(style=`height: 35px; width: 35px; borderRadius: 50%`).row.bg-primary.q-ml-xs
  //-   .col.q-pl-sm
  //-     .row.fit.content-center
  //-       .row.full-width
  //-         span.text-bold Иван Мотовилов
  //-       .row.full-width.items-center
  //-         q-icon(name="remove_red_eye" color="grey-5" size="15px").q-mr-xs
  //-         small.text-grey-5.q-mr-sm 106.3k
  //-         small.text-grey-5 yesterday
  //-   //- div(style=`height: 50px; width: 50px`).row.items-center
  //-   q-btn(flat round dense icon="bookmark_outline" size="17px")
  //- //- core
  //- div(:style=`{height: $store.state.ui.width+'px'}` @click="nodeClick").row.full-width.q-px-md.q-py-xs
  //-   div(style=`border: 5px solid #eee; borderRadius: 10px; overflow: hidden`).column.fit.bg
  //-     .col
  //-       //- TODO: placeholder for image and check for existance
  //-       img(:src="item.thumbUrl[0]" width="100%" height="100%")
  //-     div(style=`height: 50px;`).row.full-width.justify-center.items-center.q-px-sm
  //-       span.text-center {{ item.name }}
  //-     .col.full-width
  //-       img(:src="item.thumbUrl[1]" width="100%" height="100%")
  //- //- like, repost, share
</template>

<script>
import node from 'components/node'
export default {
  name: 'nodeCard',
  components: {node},
  props: {
    item: {type: Object}
  },
  data () {
    return {
      node: {},
      tags: [
        {oid: 't1', name: 'смерть'},
        {oid: 't2', name: 'сталин'},
        {oid: 't3', name: 'справедливость'},
        {oid: 't4', name: 'неприкосновенность'}
      ]
    }
  },
  methods: {
    nodeClick () {
      this.$log('nodeClick', this.item)
      this.$router.push({name: 'node'})
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
