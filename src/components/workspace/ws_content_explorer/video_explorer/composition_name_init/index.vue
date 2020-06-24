<template lang="pug">
div(
  :style=`{}`).row.full-width.q-pt-xs
  q-input(
    v-model="name"
    :value="composition ? composition.name : name"
    @input="nameChanged"
    filled dense dark color="white"
    label="What do you see?"
    @focus="nameFocused"
    @blur="nameBlurred"
    :style=`{
      background: 'rgba(60,60,60,0.5)',
    }`).full-width
    template(v-slot:prepend)
      kalpa-avatar(:url="$store.getters.currentUser().profile.photoUrl" :width="20" :height="20")
    //- template(v-slot:append)
    //-   q-btn(
    //-     v-if="name.length > 0"
    //-     @click="toggleEdit"
    //-     round flat dense color="grey-5"
    //-     :icon="pageFullscreen ? 'check' : 'keyboard_arrow_down'")
</template>

<script>
export default {
  name: 'compositionNameInit',
  inject: ['sidExplorer'],
  data () {
    return {
      name: '',
      composition: null,
    }
  },
  computed: {
    storeExplorer () {
      return window.stores[this.sidExplorer]
    }
  },
  methods: {
    nameChanged (e) {
      this.$log('nameChanged', e)
      if (this.composition) {
        this.composition.name = e
      }
      else {
        this.name = e
      }
    },
    async nameFocused (e) {
      this.$log('nameFocused')
      if (this.name.length === 0) {
        this.composition = await this.storeExplorer.compositionAdd()
        this.$log('composition', this.composition)
      }
    },
    nameBlurred (e) {
      this.$log('nameBlurred', e)
      this.name = ''
      this.composition = null
    },
  },
}
</script>
