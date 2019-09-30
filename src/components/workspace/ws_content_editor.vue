<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).row.fit.bg-white
  div(v-if="content").column.fit.bg-white
    div(:style=`{minHeight: '70px'}`).row.full-width.items-center.content-center
      //- div(:style=`{width: '70px'}`).row.full-height.br
      //- name
      .col.full-height
        .row.fit.items-center.content-center.q-px-sm
          span {{ contentLocal.name | cut(50) }}
      //- delete
      div(:style=`{width: '70px'}`).row.full-height.items-center.content-center.justify-center
        k-menu-popup(v-if="content" :name="'Точно удалить контент?'" :actions="actions" @action="contentDelete")
          q-btn(round flat icon="delete_outline" color="grey-6")
    div(ignore-body-scroll-lock).col.scroll
    //- footer
    div(:style=`{height: '80px'}`).row.full-width.items-center.content-center.q-pa-sm
      q-btn(
        v-if="!content"
        color="primary" no-caps @click="contentCreate()"
        style=`height: 60px; borderRadius: 10px; overflow: hidden`).full-width
        span.text-bold.text-white Создать контент
      q-btn(
        v-else
        color="primary" no-caps @click="contentFragment()"
        style=`height: 60px; borderRadius: 10px; overflow: hidden`).full-width
        span.text-bold.text-white Выделить фрагмент
  content-finder(v-else source="url")
</template>

<script>
import contentFinder from 'components/content_finder'

export default {
  name: 'wsContentEditor',
  components: {contentFinder},
  props: ['content'],
  data () {
    return {
      contentLocal: {
        name: '',
        tagsOids: [],
        content: {
          name: ''
        }
      },
      contentCreating: false,
      contentUpdating: false,
      contentDeleting: false,
      actions: [
        {id: 'delete', name: 'Удалить', color: 'red'}
      ]
    }
  },
  methods: {
    async contentCreate () {
      try {
        this.$log('contentCreate start')
        this.contentCreating = true
        await this.$wait(600)
        // let res = await this.$store.dispatch('workspace/addWSContent', this.contentLocal)
        this.$log('contentCreate done')
        this.contentCreating = false
        this.$emit('hide')
      } catch (e) {
        this.$log('contentCreate error', e)
        this.$q.notify(e.toString())
      }
    },
    async contentDelete () {
      try {
        this.$log('contentDelete start')
        this.contentDeleting = true
        await this.$wait(600)
        let res = await this.$store.dispatch('workspace/deleteWSContent', this.contentLocal.uid)
        this.$log('contentDelete done', res)
        this.contentDeleting = false
        this.$emit('hide')
      } catch (e) {
        this.$log('contentDelete error', e, e.code, e.message)
        this.contentDeleting = false
        this.$q.notify({color: 'red', textColor: 'white', message: e.toString()})
      }
    },
    async contentUpdate () {
      try {
        this.$log('contentUpdate start')
        this.contentUpdating = true
        await this.$wait(600)
        let res = await this.$store.dispatch('workspace/updateWSContent', this.contentLocal)
        this.$log('contentUpdate done')
        this.contentUpdating = false
        this.$emit('hide')
      } catch (e) {
        this.$log('contentUpdate error', e)
        this.contentUpdating = false
        this.$q.notify({color: 'red', textColor: 'white', message: e.toString()})
      }
    },
    async contentFragment () {
      this.$log('contentFragment')
      switch (this.content.content.type) {
        case 'VIDEO': {
          this.$log('contentFragment VIDEO')
          break
        }
        case 'IMAGE': {
          this.$log('contentFragment IMAGE')
          break
        }
      }
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.content) {
      this.$set(this, 'contentLocal', JSON.parse(JSON.stringify(this.content)))
    } else {
      this.$log('creating content')
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // this.contentUpdate()
  }
}
</script>
