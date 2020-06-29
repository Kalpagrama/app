<template lang="pug">
.column.fit
  //- header
  .row.full-width
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      //- avatar
      .col-xs-12.col-sm-4.q-pa-sm
        .row.full-width.justify-center
          input(ref="inputAvatar" type="file" @input="avatarChanged" :style=`{display: 'none',}`)
          div(
            :style=`{width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden',}`
            ).row.items-center.content-center.justify-center.b-70
            q-btn(
              v-if="!avatarUrl"
              @click="$refs.inputAvatar.click()"
              round flat color="white" icon="attach_file" size="lg"
              :style=`{borderRadius: '50%',}`)
            img(
              v-if="avatarUrl"
              @click="$refs.inputAvatar.click()"
              :src="avatarUrl"
              :style=`{
                width: '100%', height: '100%',
                borderRadius: '50%', overflow: 'hidden',
              }`)
      //- name
      .col-xs-12.col-sm-8.q-pa-sm
        .row.full-width.q-pa-xs
          q-input(
            v-model="name"
            label="Whats your name?"
            filled dark color="white").full-width
        .row.full-width.q-pa-xs
          q-select(
            filled
            dark color="white" label="Language"
            v-model="lang"
            option-value="value"
            option-label="label"
            :options="langs"
            :style=`{
              borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
              minWidth: '300px', zIndex: 2000, transform: 'translate3d(0,0,0)',
            }`).full-width
  //- footer
  .row.full-width.items-center.content-center.q-pa-md
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('prev')")
    .col
    q-btn(
      @click="$emit('next')"
      color="green" no-caps
      :disabled="nextDisabled"
      :loading="loading"
      ).q-px-md Ready
</template>

<script>
export default {
  name: 'editProfile',
  data () {
    return {
      loading: false,
      name: '',
      lang: null,
      langs: [
        {value: 'ENG', label: 'English'},
        {value: 'РУС', label: 'Русский'},
      ],
      avatarFile: null,
      avatarUrl: null,
    }
  },
  computed: {
    nextDisabled () {
      return this.name.length === 0 || this.lang === null || this.avatarFile === null
    }
  },
  methods: {
    avatarChanged (e) {
      this.$log('avatarChanged', e)
      this.avatarFile = e.target.files[0]
      this.avatarUrl = URL.createObjectURL(this.avatarFile)
    },
    langSelected (l) {
      this.$log('langSelected', l)
      this.lang = l.value
    },
    langLabel (lang) {
      return this.langs.find(l => l.value === lang)[0].label
    },
    async next () {
      this.$log('next')
      this.loading = true
      await this.$wait(1000)
      let oid = this.$store.getters.currentUser().oid
      // set avatar,name,lang
      await this.$store.dispatch('objects/update', {oid, path: 'profile.avatar', newValue: this.avatarFile})
      await this.$store.dispatch('objects/update', {oid, path: 'profile.lang', newValue: this.lang})
      await this.$store.dispatch('objects/update', {oid, path: 'profile.name', newValue: this.name})
      // done
      this.loading = false
      this.$emit('next')
    }
  }
}
</script>
