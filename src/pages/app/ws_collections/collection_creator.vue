<template lang="pug">
div(
  :style=`{borderRadius: '10px',}`
  ).row.full-width.items-start.content-start.b-40.q-pa-lg
  //- header
  div(
    :style=`{
      position: 'relative',
      height: '60px',
    }`
    ).row.full-width.justify-start.items-center.q-mb-lg
    span(:style=`{fontSize: '18px'}`).text-white.text-bold Создать коллекцию
    q-btn(
      @click="$emit('close')"
      round flat color="white" icon="clear"
      :style=`{
        position: 'absolute', zIndex: 100, top: '10px', right: 0,
      }`)
  .row.full-width
    //- edit name
    div(:style=`{position: 'relative', zIndex: 10, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      q-input(
        v-model="name"
        filled dark color="green"
        placeholder="Введите название"
        :autofocus="nameInputAutofocus"
        @keyup.enter="create()").full-width
    //- edit spheres...
    div(:style=`{height: '60px'}`).row.full-width
    //- footer: create
    .row.full-width.justify-end.q-mt-lg
      q-btn(
        @click="create()"
        no-caps size="lg"
        :disabled="!createCan"
        :color="!createCan ? 'grey-8' : 'green'"
        :loading="creating").q-px-md
        span.text-bold Создать
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'collectionCreator',
  data () {
    return {
      name: '',
      creating: false
    }
  },
  computed: {
    createCan () {
      return this.name.length > 0
    },
    nameInputAutofocus () {
      if (this.$q.screen.width < 800) return false
      else return true
    }
  },
  methods: {
    async create () {
      try {
        this.$log('create start', this.name)
        this.creating = true
        let collectionInput = {
          name: this.name
        }
        let feed = await this.$rxdb.set(RxCollectionEnum.WS_COLLECTION, collectionInput)
        this.$log('create done', feed)
        this.creating = false
        this.$emit('close')
      }
      catch (e) {
        this.$log('create error', e)
        this.creating = false
      }
    }
  }
}
</script>
