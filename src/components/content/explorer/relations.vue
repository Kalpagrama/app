<template lang="pug">
div(
  :style=`{position: 'relative', width: width+'px'}`
  ).row.full-height.bg-grey-10
  //- toggle
  div(
    :style=`{
      position: 'absolute', top: 0, left: '-72px', zIndex: 1000,
      width: '72px', height: '72px'
    }`).row.items-center.justify-center.content-center
    q-btn(
      flat color="green" @click="show = !show"
      :icon="show ? 'keyboard_arrow_right' : 'keyboard_arrow_left'"
      :style=`{width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255, 0.3)'}`)
  div(
    :style=`{overflow: 'hidden'}`
    ).column.fit
    //- header
    div(
      :style=`{height: '60px'}`
      ).row.full-width
      .col.full-height
        div(:style=`{overflow: 'hidden'}`).row.fit.items-center.q-px-md
          //- toggle content: nodes, compositions, spheres, users
          span(:style=`{whiteSpace: 'nowrap'}`).text-bold.text-white Content nodes
          q-icon(name="keyboard_arrow_down" size="20px" color="white").q-mx-sm
      //- sort them
      div(:style=`{height: '60px'}`).row.items-center.q-pr-md
        q-btn(
          flat color="green"
          :style=`{width: '40px', height: '40px'}`) L
        q-btn(
          flat color="green"
          :style=`{width: '40px', height: '40px'}`) F
        q-btn(
          flat color="green"
          :style=`{width: '40px', height: '40px'}`) G
        q-btn(
          flat color="green" icon="add" @click="$router.push('/content')"
          :style=`{width: '40px', height: '40px'}`)
    //- body
    .col.full-width.scroll
      .row.full-width.items-start.content-start.q-px-md
        div(
          v-for="(i, ii) in items" :key="ii" @click="itemClick(i,ii)"
          :style=`{minHeight: '30px', overflow: 'hidden', borderBottom: '1px solid #eee'}`
          ).row.full-width.items-center.content-center.justify-start
          div(:style=`{
            borderRadius: '6px', overflow: 'hidden',
            color: 'white', background: typeLabel(i.type).background}`
            ).row.items-center.justify-center.q-px-sm.q-mr-sm
            span.text-white {{typeLabel(i.type).name}}
          span.text-white {{ i.name | cut(50) }}
</template>

<script>
export default {
  name: 'contentExplorerRelations',
  props: ['content'],
  data () {
    return {
      show: false,
      width: 0,
      items: []
    }
  },
  watch: {
    show: {
      immediate: true,
      handler (to, from) {
        this.$log('show CHANGED', to)
        this.$tween.to(this, 0.5, {width: to ? 500 : 0})
      }
    }
  },
  methods: {
    typeLabel (type) {
      switch (type) {
        case 'VIDEO': {
          return {name: 'Video', color: 'white', background: 'red'}
        }
        case 'IMAGE': {
          return {name: 'Image', color: 'white', background: 'green'}
        }
      }
    },
    itemClick (i, ii) {
      this.$log('itemClick', i, i)
      this.$router.push('/content/' + i.oid)
    }
  },
  async mounted () {
    this.$log('mounted')
    let {items} = await this.$store.dispatch('lists/wsItems', {wsItemsType: 'CONTENTS'})
    this.$log('items', items)
    this.items = items
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
