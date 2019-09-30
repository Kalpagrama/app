<template lang="pug">
div(v-if="tagLocal" :style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  //- header
  div(:style=`{height: '70px'}`).row.full-width.items-center
    //- name
    .col
      .row.fit.items-center.content-center.q-px-md
        span.text-bold.text-black {{ tagLocal.name }}
    //- delete
    div(:style=`{height: '70px', width: '70px'}`).row.items-center.justify-center
      k-menu-popup(v-if="tag" :name="'Точно удалить тэг?'" :actions="actions" @action="tagDelete")
        q-btn(round flat icon="delete_outline" color="grey-6")
  //- body
  div(ignore-body-scroll-lock).col.scroll
    //- wrapper
    .row.full-width.items-start.content-start
      //- name
      .row.full-width.q-px-sm
        div(:style=`{borderRadius: '10px', overflow: 'hidden', zIndex: 100}`).row.full-width
          q-input(v-model="tagLocal.name" filled placeholder="Тэг (обязательно)").full-width
      //- color
      .row.full-width.q-pa-sm
        div(
          v-for="(c, ci) in colors" :key="ci" @click="tagLocal.color = c"
          :class="`bg-${c}`"
          :style=`{height: '50px', width: '50px', borderRadius: '10px', overflow: 'hidden'}`
          ).row.q-mr-sm
      //- small {{ tagLocal }}
  //- footer fot tag creation
  div(v-if="!tag" :style=`{height: '80px'}`).row.full-width.items-center.q-px-sm
    q-btn(
      color="primary" no-caps :loading="tagCreating" @click="tagCreate()"
      style=`height: 60px; borderRadius: 10px; overflow: hidden`).full-width
      span.text-white.text-bold Создать тэг
</template>

<script>
export default {
  name: 'addWSTag',
  props: ['tag'],
  data () {
    return {
      tagLocal: {
        name: '',
        color: 'red-4',
        icon: 'gesture'
      },
      tagCreating: false,
      tagDeleting: false,
      tagUpdating: false,
      actions: [
        {id: 'delete', name: 'Удалить', color: 'red'}
      ],
      colors: ['red-4', 'green-4', 'blue-4', 'orange-4']
    }
  },
  methods: {
    async tagDelete (e) {
      try {
        this.$log('tagDelete start')
        this.tagDeleting = true
        await this.$wait(600)
        if (!this.tag) throw new Error(`Cant delete tag!`)
        let res = await this.$store.dispatch('workspace/deleteWSTag', this.tagLocal.uid)
        this.$log('tagDelete done', res)
        this.tagDeleting = false
        this.$emit('hide')
      } catch (e) {
        this.$log('tagDelete error', e)
        this.tagDeleting = false
        this.$q.notify(e.toString())
      }
    },
    async tagCreate () {
      try {
        this.$log('tagCreate start', this.tagLocal)
        this.tagCreating = true
        await this.$wait(600)
        if (this.tag) throw new Error(`Cant create tag!`)
        let res = await this.$store.dispatch('workspace/addWSTag', this.tagLocal)
        this.$log('tagCreate done', res)
        this.tagCreating = false
        this.$emit('hide')
      } catch (e) {
        this.$log('tagCreate error', e)
        this.tagCreating = false
        this.$q.notify(e.toString())
      }
    },
    async tagUpdate () {
      try {
        this.$log('tagUpdate start')
        this.tagUpdating = true
        await this.$wait(600)
        if (this.tagLocal.name.length === 0) throw new Error(`No tag name!`)
        let res = await this.$store.dispatch('workspace/updateWSTag', this.tagLocal)
        this.$log('tagUpdate done')
        this.tagUpdating = false
        this.$emit('hide')
      } catch (e) {
        this.$log('tagUpdate error', e)
        this.$q.notify(e.toString())
      }
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.tag) this.$set(this, 'tagLocal', JSON.parse(JSON.stringify(this.tag)))
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.tag) this.tagUpdate()
  }
}
</script>
