<template lang="pug">
q-layout(
  container
  view="lHh lpR lFf"
  :style=`{
    height: $q.screen.height+'px',
  }`
  ).b-30.br
  q-footer
    div.row.full-width.items-center.content-center.q-pa-sm
      q-btn(
        round flat color="white" icon="west"
        @click="$emit('close')")
      .col
        q-btn(
          color="green" no-caps
          :style=`{
            height: '40px',
          }`
          ).full-width Publish
  q-page-container
    q-page
      .row.full-width.q-pa-sm
        q-input(
          v-model="essence"
          borderless dark
          placeholder="Type here..."
          type="textarea" autogrow
          :input-style=`{
            padding: '10px',
          }`
          ).full-width.br
</template>

<script>
export default {
  name: 'itemCreator',
  data () {
    return {
      essence: ''
    }
  }
}
</script>
