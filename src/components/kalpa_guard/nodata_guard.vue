// Компонент отображающий пояснение что будет находиться в списке, если там пока ничего нет
<template lang="pug">
div(
  :style=`{
  height: '50vh',
  }`
  ).row.full-width.justify-center.q-mb-lg
    div(
      :style=`{
      backgroundColor: backgroundColor,
      maxWidth: $store.state.ui.pageWidth+'px',
      borderRadius: '10px',
    }`).row.full-width.items-center.content-center.justify-center.q-pa-md
      .row.full-width.justify-center
        q-icon(:name="icon" color="grey-8" size="100px")
      div(
       :style=`{textAlign: 'center'}`
      ).row.full-width.justify-center
       span.text-white.text-h6.q-mb-sm  {{title}}
       span.text-white.full-width  {{message}}
      .row.full-width.justify-center.q-pt-md
        q-btn(v-if="button"
          outline color="white" no-caps
        :style=`{
          height: '50px',
          minWidth: '200px',
        }`
          @click="$go(clickPath)"
        )
          h1.text-white {{ buttonName }}
        slot(name="footer")
      //div(:style=`{minHeight: '80px'}`).row.full-width.justify-center.q-pt-md
</template>

<script>
export default {
  name: 'view_empty',
  props: {
    button: {type: Boolean, default: false},
    icon: {type: String},
    title: {type: String},
    message: {type: String},
    buttonName: {type: String},
    clickPath: {type: String},
    backgroundColor: {type: String, default: 'rgba(35,35,35,1)'},
  },
}
</script>
