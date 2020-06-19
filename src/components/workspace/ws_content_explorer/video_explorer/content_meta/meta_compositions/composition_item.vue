<template lang="pug">
.row.full-width
  //- name and make it active...
  div(
    v-if="stateExplorer.compositionSelected !== composition.id"
    @click="compositionSelect()"
    :style=`{height: '40px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
    ).row.full-width.items-center.content-center.q-px-md.b-60.cursor-pointer.composition-item
    span(:style=`{userSelect: 'none'}`).text-bold.text-white {{ composition.name }}
  //- editor with only progress
  ws-composition-editor(
    v-if="stateExplorer.compositionSelected === composition.id && !stateExplorer.compositionEditing"
    :value="composition"
    :stateExplorer="stateExplorer"
    :options=`{
      usePlayer: false,
      onlyProgress: true,
    }`
    :style=`{
      borderRadius: $store.state.ui.borderRadius+'px',
      overflow: 'hidden',
    }`).b-60
    template(v-slot:actions)
      q-btn(round flat dense color="grey-6" icon="edit" @click="$emit('edit')")
      q-btn(round flat dense color="green" icon="check" @click="stateExplorer.set('compositionSelected', null)")
</template>

<script>
// TODO: disable when editing...
export default {
  name: 'compositionItem',
  props: ['stateExplorer', 'composition'],
  data () {
    return {
    }
  },
  methods: {
    compositionSelect () {
      this.$log('compositionSelect')
      this.stateExplorer.set('composition', this.composition)
      this.stateExplorer.set('compositionSelected', this.composition.id)
    }
  }
}
</script>
