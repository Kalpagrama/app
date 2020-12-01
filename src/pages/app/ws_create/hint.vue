<template lang="pug">
div(
  :style=`{
    background: hint.background,
  }`
  ).row
  .row.full-width.q-pa-sm
    //- preview
    //- span(
      v-if="!editingLocal"
      @click="editingLocal = true"
      :style=`{
        fontSize: rowsWidth/hint.nameSize+'px',
        //- pointerEvents: 'none',
        cursor: 'grabbing',
        userSelect: 'none',
      }`
      ).text-white.text-bold {{ hint.name }}
    //- editing
    q-input(
      v-if="true"
      v-model="hint.name"
      ref="hintNameInput"
      borderless
      @keyup.enter="editingDone"
      @blur="editingLocal = false"
      :input-style=`{
        fontSize: rowsWidth/hint.nameSize+'px',
        fontWeight: 'bold',
        color: 'white',
        width: hint.name.length+2+'ch',
        minWidth: '20px',
        textAlign: 'center',
        //- padding: '10px',
      }`
      :style=`{
        //- padding: '0px',
        //- width: hint.name.length+3+'ch',
        //- minWidth: '100px',
      }`).full-width
  //- input(
    v-model="hint.name"
    @keyup.enter="editingDone"
    @blur="editingDone"
    :style=`{
      fontSize: rowsWidth/hint.nameSize+'px',
      fontWeight: 'bold',
      color: 'white',
      background: 'black',
      paddingRight: '0px',
      textAlign: 'center',
      width: 'auto',
    }`
    )
  div(
    v-if="!editingLocal"
    @click="editingLocal = true"
    :style=`{
      position: 'absolute', zIndex: 100, top: 0,
    }`
    ).row.fit
  //- editing CLOSE btn
  //- q-btn(
    v-if="editingLocal"
    @click="editingDone"
    round flat color="green" icon="check"
    :style=`{
      position: 'absolute', zIndex: zIndex,
      right: '0px', bottom: '-40px',
    }`)
</template>

<script>
export default {
  name: 'hint',
  props: ['hint', 'editing', 'rowsHeight', 'rowsWidth', 'options', 'zIndex'],
  data () {
    return {
      editingLocal: false,
    }
  },
  watch: {
    editingLocal: {
      handler (to, from) {
        if (to) {
          this.$refs.hintNameInput.focus()
        }
      }
    }
  },
  methods: {
    editingDone () {
      this.$log('editingDone')
      if (this.hint.name.length > 0) {
        this.editingLocal = false
        this.$refs.hintNameInput.blur()
      }
      else {
        this.$q.notify({type: 'negative', position: 'top', message: 'Cant save empty hint!'})
      }
    }
  }
}
</script>
