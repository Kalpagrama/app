<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.bg-white
  div(:style=`{height: '70px'}`).row.full-width.items-center
    .col.full-height
      .row.fit.items-center.q-px-md
        span.text-bold {{ fragment.name }}
    div(:style=`{height: '70px', width: '70px'}`).row.items-center.justify-center
      q-btn(round flat color="grey-6" icon="delete_outline")
  .col.scroll.full-width
    .row.full-width.items-start.content-start.q-px-sm
      .row.full-width
        div(:style=`{borderRadius: '10px', overflow: 'hidden', position: 'relative', zIndex: 100}`).row.full-width
          q-input(v-model="fragment.name" filled).full-width
      small {{ fragment }}
  q-btn(
    color="primary" no-caps @click="fragmentEdit()"
    :style=`{position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000, width: 'calc(100% - 20px)', height: '60px', borderRadius: '10px'}`)
    span.text-bold.text-white В редактор
</template>

<script>
export default {
  name: 'nodeFragment',
  props: ['fragment'],
  data () {
    return {
      loading: true
    }
  },
  methods: {
    fragmentEdit () {
      this.$log('fragmentEdit')
    }
  },
  async mounted () {
    this.$log('mounted')
    await this.$wait(300)
    this.loading = false
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
