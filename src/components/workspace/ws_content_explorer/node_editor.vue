<template lang="pug">
div(
  :style=`{
    borderRadius: '10px 10px 0 0',
    overflow: 'hidden',
  }`
  ).column.full-width.b-50.fit
  .row.full-width.items-start.content-start.q-pa-sm
    //- q-btn(
    //-   @click="toggle()"
    //-   round flat color="white"
    //-   :icon="stateExplorer.nodeEditorOpened ? 'keyboard_arrow_down' : 'edit'"
    //-   :style=`{width: '56px', height: '56px'}`)
    .col
      q-input(
        :value="layerName"
        @input="nameInputChanged"
        @focus="nameInputFocused"
        @blur="nameInputBlurred"
        filled dark color="grey-5"
        autogrow
        autofocus
        placeholder="What do you see?"
        :style=`{borderRadius: '10px', overflow: 'hidden',}`
        ).full-widthtn
    //- q-btn(
    //-   @click="toggle()"
    //-   round flat color="green" icon="check"
    //-   :style=`{width: '56px', height: '56px'}`)
  .col.full-width
    .row.full-width
      //- small.text-white {{stateExplorer.layer}}
  .row.full-width.items-center.content-center.q-pa-sm
    q-btn(
      round flat color="red" icon="delete_outline"
    )
    .col
    q-btn(
      @click="stateExplorer.set('nodeEditorOpened', false)"
      round flat color="green" icon="check")
</template>

<script>
export default {
  name: 'nodeEditor',
  props: ['stateExplorer'],
  data () {
    return {
      name: '',
      height: 70
    }
  },
  computed: {
    layer () {
      return this.stateExplorer.layer
    },
    layerName () {
      if (this.layer) {
        if (this.layer.spheres.length > 0) return this.layer.spheres[0].name
        else return ''
      }
      else {
        return ''
      }
    }
  },
  watch: {
    'stateExplorer.nodeEditorOpened': {
      async handler (to, from) {
        this.$log('stateExplorer.nodeEditorOpened CHANGED', to)
        this.$tween.to(this, 0.2, {height: to ? this.stateExplorer.height : 70})
        // if (to) {
        //   await this.$wait(1000)
        //   this.height = this.stateExplorer.height
        // }
        // else {
        //   this.height = 70
        // }
        // this.height = to ? this.stateExplorer.height : 70
      }
    },
    'stateExplorer.layerId': {
      handler (to, from) {
        this.$log('stateExplorer.layerId CHANGED', to)
      }
    }
  },
  methods: {
    toggle () {
      this.$log('toggle')
      this.stateExplorer.set('nodeEditorOpened', !this.stateExplorer.nodeEditorOpened)
    },
    nameInputChanged (e) {
      this.$log('nameInputChanged', e)
      if (this.layer) {
        this.$set(this.layer.spheres, 0, {name: e})
      }
    },
    nameInputFocused () {
      this.$log('nameInputFocused')
      if (this.stateExplorer.nodeEditorOpened) return
      this.toggle()
    },
    nameInputBlurred () {
      this.$log('nameInputBlurred')
      // this.toggle()
    }
  }
}
</script>
