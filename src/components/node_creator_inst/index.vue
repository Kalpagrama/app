<template lang="pug">
div(:style=`{position: 'relative', minHeight: '100vh'}`).row.full-width.bg-grey-3
  q-dialog(ref="contentFindDialog" position="bottom")
    content-find(@close="$refs.contentFindDialog.hide()")
  //- header
  div(:style=`{position: 'fixed', zIndex: 1000, height: '60px', width: $q.screen.gt.sm ? 'calc(100% - 60px)' : '100%'}`
    ).row.items-center.q-px-md.bg-white
    q-btn(v-if="step !== 'chooseFragments'" icon-right="keyboard_arrow_left" flat color="primary" @click="prev()" no-caps style=`width: 40px`)
    .col
      .row.full-width.justify-center.q-px-sm
        span.text-bold {{ steps[step].name }}
    //- q-btn(icon="help_outline" color="grey-6" round flat)
    q-btn(v-if="fragments.length > 0" icon-right="keyboard_arrow_right" color="primary" @click="next()" no-caps) Далее
  //- wrapper of steps
  div(:style=`{marginTop: '60px'}`).row.full-width.items-start.content-start.justify-center.q-pt-md
    //- chooseFragments
    div(v-if="step === 'chooseFragments'" :style=`{maxWidth: '500px'}`).row.full-width.q-px-md
      //- fragments list
      div(
        v-for="(f, fi) in fragments" :key="fi"
        :style=`{position: 'relative', minHeight: '150px', borderRadius: '8px', overflow: 'hidden'}`).row.full-width.items-start.bg-white.q-mb-md
        div(:style=`{position: 'absolute', zIndex: 100, top: '8px', right: '8px', height: '40px'}`).row
          q-btn(round flat dense color="white" icon="edit" @click="fragmentEdit(fi)")
          q-btn(round flat dense color="white" icon="clear" @click="fragmentDelete(fi)").q-ml-sm
        img(:src="'https://storage.yandexcloud.net/kalpa1-thumbs/ex/n0/136940737697882124_600_0.jpg'"
          :style=`{width: '100%', objectFit: 'contain'}`)
      //- fragment add
      div(
        v-if="fragments.length < 4"
        :style=`{height: '100px', borderRadius: '8px', overflow: 'hidden', marginBottom: '100px'}`
        ).row.full-width.items-center.justify-center.bg-white
        q-btn(icon="add" color="primary" round outline size="lg" @click="fragmentAdd()")
</template>

<script>
import contentFind from './content_find'

export default {
  name: 'nodeCreator',
  components: {contentFind},
  data () {
    return {
      step: 'chooseFragments',
      steps: {
        chooseFragments: {name: 'Добавьте фрагменты'},
        chooseNameAndSpheres: {name: 'Добавьте суть и сферы'},
        chooseTemplate: {name: 'Выберите шаблон'}
      },
      fragments: []
    }
  },
  methods: {
    next () {
      this.$log('next')
      switch (this.step) {
        case 0: {
          this.step = 1
          break
        }
        case 1: {
          this.step = 2
          break
        }
      }
    },
    prev () {
      this.$log('prev')
    },
    fragmentAdd () {
      this.$log('fragmentAdd')
      this.$refs.contentFindDialog.show()
      // if (this.fragments.length > 3) return
      // open content finder dialog
      // find content then prepare fragment
      // emit on fragment?
      // then add fragment
      // this.$set(
      //   this.fragments,
      //   this.fragments.length,
      //   {
      //     url: '',
      //     content: {
      //       type: 'VIDEO',
      //       url: ''
      //     }
      //   }
      // )
    },
    fragmentEdit (index) {
      this.$log('fragmentEdit', index)
    },
    fragmentDelete (index) {
      this.$log('fragmentDelete', index)
      this.$delete(this.fragments, index)
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
