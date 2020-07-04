<template lang="pug">
.row.full-width.q-py-sm
  q-btn(
    flat color="green" icon="add" no-caps
    :style=`{height: '40px',}`).full-width {{$t('ws_node_editor_add_sphere', 'Добавить сферу')}}
</template>

<script>
export default {
  name: 'editSpheres',
  props: ['node'],
  data () {
    return {
    }
  }
}
</script>
