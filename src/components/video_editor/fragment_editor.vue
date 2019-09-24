<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).column.fit.bg-white
  //- cover
  div(v-if="false" :style=`{position: 'absolute', top: '0px', zIndex: 10}`).row.full-width.full-height
    img(:src="fragment.thumbUrl" :style=`{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2}`)
  //- header
  div(:style=`{zIndex: 100, height: '70px'}`).row.full-width.items-center.content-center
    .col
      .row.fit.q-pa-md
        span.text-bold {{ fragment.label }}
    //- div(:style=`{width: '70px', height: '70px'}`).row.items-center.justify-center
      //- q-btn(round flat icon="clear" color="white" style=`opacity: 0.5`).bg-grey-9
  .col.full-width
    //- input name
    .row.full-width.q-px-sm
      div(:style=`{borderRadius: '10px', overflow: 'hidden', zIndex: 100}`).row.fit
        q-input(v-model="fragment.label" filled :label="'Label'").full-width
    .row.full-width.q-px-sm
      small(@click="$refs.fragmentDialog.hide()") {{ fragment }}
  div(v-if="false").row.full-width.q-pa-sm
    q-btn(color="primary" no-caps style=`borderRadius: 10px; height: 60px` @click="$emit('preview')").full-width
      span.text-bold.text-white Проиграть
  .row.full-width.q-pa-sm
    q-btn(outline color="red" no-caps style=`borderRadius: 10px; height: 50px` @click="$emit('delete')").full-width
      span Удалить фрагмент
</template>

<script>
export default {
  name: 'videoEditor__fragmentEditor',
  props: ['fragment'],
  data () {
    return {
    }
  }
}
</script>
