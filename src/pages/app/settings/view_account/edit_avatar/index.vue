<template lang="pug">
.row.full-width.justify-center
  //- editor of avatar with imageCropper
  q-dialog(
    v-model="avatarEditorOpened"
    maximized)
    editor(
      :avatarUrl="avatarUrl"
      :style=`{
        height: $q.screen.height+'px',
        width: $q.screen.width+'px',
      }`
      @avatar="avatarEdited"
      @close="avatarEditorOpened = false")
  //- header
  .row.full-width.q-px-md
    span.text-bold.text-white {{ $t('Avatar', 'Аватар') }}
  //- preview & actions
  .row.full-width.q-py-sm
    div(
      :style=`{
        maxWidth: '200px',
      }`
      ).row.full-width.items-start.content-start
      //- preview
      div(
        :style=`{width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden',}`
        ).row.items-center.content-center.justify-center.b-70
        //- q-btn(
          v-if="!avatarUrl"
          @click="$refs.inputAvatar.click()"
          round flat color="white" icon="attach_file" size="lg"
          :style=`{borderRadius: '50%',}`)
        img(
          v-if="$store.getters.currentUser().thumbUrl"
          :src="$store.getters.currentUser().thumbUrl"
          :style=`{
            width: '100%', height: '100%',
            borderRadius: '50%', overflow: 'hidden',
          }`)
      //- actions
      .row.full-width.justify-center.q-pa-sm
        //- edit
        //- fake input...
        input(ref="inputAvatar" type="file" @input="avatarChanged" :style=`{display: 'none',}`)
        q-btn(
          v-if="$store.getters.currentUser().thumbUrl"
          @click="$refs.inputAvatar.click()"
          flat dense color="grey-6" no-caps) Изменить
        //- remove
        //- random
        //- pick
</template>

<script>
import { ObjectApi } from 'src/api/object'
import editor from './editor.vue'

export default {
  name: 'editAvatar',
  props: ['currentUser'],
  components: {
    editor,
  },
  data () {
    return {
      avatarUrl: null,
      avatarEditorOpened: false,
    }
  },
  methods: {
    async avatarChanged (e) {
      this.$log('avatarChanged', e)
      this.avatarUrl = URL.createObjectURL(e.target.files[0])
      this.avatarEditorOpened = true
      // destroy value ?
      this.$refs.inputAvatar.value = null
    },
    async avatarEdited (file) {
      this.$log('avatarEdited', file)
      this.avatarEditorOpened = false
      await ObjectApi.update(this.currentUser.oid, 'profile.photo', file)
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.avatarURL) URL.revokeObjectURL(this.avatarURL)
  }
}
</script>
