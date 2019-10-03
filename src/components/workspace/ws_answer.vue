<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  //- header
  div(:style=`{minHeight: '80px'}`).row.full-width.items-center.q-pa-sm
    .row.full-width.q-pa-sm
      span.text-bold Ответить на
    div(:style=`{minHeight: '50px'}`).row.full-width
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-grey-1.q-pa-sm
        span.text-italic "{{ value.name }}"
  .col.full-width.scroll
    .row.full-width.q-px-md.q-py-sm.q-mt-md
      span.text-bold А что ты в этом видишь?
    .row.full-width.q-px-sm
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width
        q-input(v-model="answer.name" type="textarea" filled placeholder="Твоя суть").full-width
  //- footer
  div(:style=`{position: 'absolute', bottom: '0px', zIndex: 1000, height: '76px', background: 'rgba(255, 255, 255, 0.8)'}`
    ).row.full-width.items-center.content-center.q-px-sm
    q-btn(
      no-caps color="primary" :loading="answering" @click="handleAnswer()"
      style=`height: 60px; borderRadius: 10px; overflow: hidden`).full-width
      span(v-if="!answered").text-bold.text-white Ответить
      q-icon(v-else name="check" color="white" size="40px")
</template>

<script>
export default {
  name: 'wsNodeAnswer',
  props: ['value'],
  data () {
    return {
      answer: {
        name: ''
      },
      answering: false,
      answered: false
    }
  },
  methods: {
    async handleAnswer () {
      try {
        this.$log('handleAnswer start')
        if (this.answer.name.lenth === 0) return
        this.answering = true
        await this.$wait(1000)
        this.$log('handleAnswer done')
        this.answering = false
        this.$emit('hide')
      } catch (error) {
        this.$log('handleAnswer error', error)
        this.answering = false
      }
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
