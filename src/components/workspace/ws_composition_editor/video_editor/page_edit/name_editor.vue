<template lang="pug">
div(:style=`{position: 'relative',overflow: 'hidden',}`).row.full-width.items-center.content-center
  //- interceptor tint
  div(
    @click="interceptorClick"
    :style=`{position: 'absolute', left: 0, zIndex: 300, maxWidth: 'calc(100% - 60px)',}`).row.fit.cursor-pointer
  //- interceptor dialog
  q-dialog(v-model="interceptorDialogOpened" position="bottom")
    //- @submit.prevent="onSubmit"
    div(
      :style=`{height: $q.screen.height-60+'px', minHeight: $q.screen.height-60+'px', borderRadius: '10px', overflow: 'hidden',}`).column.full-width.b-50
      //- @blur="interceptorDialogOpened = false"
      //- @enter="interceptorDialogOpened = false"
      q-input(
        ref="interceptorInput"
        v-model="composition.name"
        filled dark color="white"
        :label="$t('wsCompositionEditor_videoEditor_inputTitle', 'Заголовок')"
        @blur="interceptorDialogOpened = false"
        ).full-width
  //- input
  q-input(
    v-model="composition.name"
    ref="compositionNameInput"
    dark color="green"
    :label="$t('wsCompositionEditor_videoEditor_inputTitle', 'Заголовок')"
    :placeholder="$t('wsCompositionEditor_videoEditor_whatDoYouSee', 'Что ты видишь?')"
    @click="onClick"
    @focus="onFocus"
    @blur="onBlur"
    :style=`{
      paddingLeft: '10px',
      paddingRight: '10px',
      marginBottom: '-2px',
    }`
    ).full-width
    //- template(v-slot:append)
    //-   q-btn(round flat color="green" icon="check" @click="$emit('close')")
</template>

<script>
export default {
  name: 'nameEditor',
  props: ['composition'],
  data () {
    return {
      interceptorDialogOpened: false,
      // readonly: true,
    }
  },
  computed: {
    interceptInput () {
      return this.$q.screen.width < 800
    }
  },
  methods: {
    async interceptorClick (e) {
      this.$log('interceptorClick', e)
      if (this.interceptInput) {
        // open special dialog
        this.interceptorDialogOpened = true
        await this.$wait(250)
        this.$refs.interceptorInput.focus()
      }
      else {
        this.$refs.compositionNameInput.focus()
      }
    },
    onSubmit (e) {
      this.$log('onSubmit', e)
      this.interceptorDialogOpened = false
    },
    onClick (e) {
      this.$log('onClick', e)
    },
    onFocus (e) {
      this.$log('onFocus', e)
    },
    onBlur (e) {
      this.$log('onBlur', e)
    }
  }
}
</script>
