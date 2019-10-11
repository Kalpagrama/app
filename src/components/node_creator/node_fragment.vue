<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.bg-white
  div(:style=`{height: '70px'}`).row.full-width.items-center
    .col.full-height
      .row.fit.items-center.q-px-md
        span.text-bold {{ fragment.name }}
    div(:style=`{height: '70px', width: '70px'}`).row.items-center.justify-center
      q-btn(round flat color="grey-6" icon="delete_outline" @click="$emit('delete'), $emit('hide')")
  .col.scroll.full-width
    .row.full-width.items-start.content-start.q-px-sm
      .row.full-width
        div(:style=`{borderRadius: '10px', overflow: 'hidden', position: 'relative', zIndex: 100}`).row.full-width
          q-input(v-model="fragment.name" filled placeholder="Enter fragment name").full-width
      div(:style=`{height: '300px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-width.items-center.justify-center.q-my-md.bg-grey-3
        span Fragment preview
      //- small {{ fragment }}
  //- actions
  transition(
    appear
    enter-active-class="animated slideInUp"
    leave-active-class="animated slideOutDown")
    q-btn(
      v-if="!loading"
      color="primary" no-caps @click="$emit('editor')" outline
      :style=`{position: 'absolute', bottom: '80px', left: '10px', zIndex: 1000, width: 'calc(100% - 20px)', height: '60px', borderRadius: '10px'}`)
      span.text-bold В редактор
  transition(
    appear
    enter-active-class="animated slideInUp"
    leave-active-class="animated slideOutDown")
    q-btn(
      v-if="!loading"
      color="primary" no-caps @click="$emit('hide')"
      :style=`{position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000, width: 'calc(100% - 20px)', height: '60px', borderRadius: '10px'}`)
      span.text-bold.text-white Готово
</template>

<script>
export default {
  name: 'nodeFragment',
  props: ['fragment'],
  data () {
    return {
      loading: true,
      content: null
    }
  },
  methods: {
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
