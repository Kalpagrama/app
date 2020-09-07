<template lang="pug">
.row.full-width.justify-center
  //- mockap of creating node...
  div(
    :style=`{
      position: 'relative',
      borderRadius: '10px', overflow: 'hidden',
    }`).row.full-width.items-end.content-end.justify-center.b-50
    //- auhtor mockup
    div(
      :style=`{
        height: '40px',
      }`
      ).row.full-width.b-50
    //- first item wrapper
    div(
      :style=`{
        height: '400px',
        borderRadius: '10px', overflow: 'hidden',
      }`
      ).row.full-width.items-center.content-center.justify-center.b-40
      q-circular-progress(
        show-value
        class="text-green"
        :value="$store.state.core.progressInfo.CREATE[$route.params.oid]"
        size="160px" :thickness="0.1"
        color="green")
    //- essence
    div(
      :style=`{
        height: '60px',
      }`).row.full-width.items-center.content-center.b-50.q-pa-lg
      //- mock essence
      div(:style=`{height: '8px', borderRadius: '4px', maxWidth: '90%'}`).row.full-width.b-60.q-mb-sm
      div(:style=`{height: '8px', borderRadius: '4px', maxWidth: '70%'}`).row.full-width.b-60
</template>

<script>
export default {
  name: 'pageApp_node_nodeMockup',
  props: ['value'],
  data () {
    return {
    }
  }
}
</script>
