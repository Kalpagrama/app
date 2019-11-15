<template lang="pug">
div(:style=`{paddingBottom: '70px'}`).row.justify-start.content-start.q-pt-sm.q-px-sm
  node(
    :node="node" :nodeFull="node"
    :style=`{borderRadius: '10px'}`).bg-white.q-mb-md
  div(
    :style=`{height: 'auto', borderRadius: '10px'}`
    ).row.full-width.items-end.bg-white.q-pa-md.q-mb-md
    .row.full-width.q-pa-sm
      span.text-bold В чем суть?
    div(:style=`{position: 'relative', zIndex: 100, overflow: 'hidden', borderRadius: '10px'}`).row.full-width
      q-input(v-model="name" filled type="textarea" :rows="3").full-width
  div(
    :style=`{borderRadius: '10px'}`
    ).row.full-width.bg-white.q-mb-md
    .row.full-width.items-start.content-start.q-pa-md
      .row.full-width.q-pa-sm
        span.text-bold Шаблон
      div(:style=`{height: '56px', borderRadius: '10px'}`).row.full-width.items-center.justify-between.q-px-sm.bg-grey-2
        span Картинка в картинке
        q-icon(size="26px" name="keyboard_arrow_down")
      .row.full-width.q-pa-sm
        span.text-bold Категория
      div(:style=`{height: '56px', borderRadius: '10px'}`).row.full-width.items-center.justify-between.q-px-sm.bg-grey-2
        span(:style=`{borderRadius: '10px'}`).bg-green.q-px-md.q-py-sm.text-white #Развлечения
        q-icon(size="26px" name="keyboard_arrow_down")
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    q-btn(
      v-if="tab === 'preview'"
      color="green" push no-caps @click="publish()"
      :loading="publishing"
      :style=`{position: 'absolute', left: '8px', bottom: '8px', height: '60px',
        width: 'calc(100% - 16px)', borderRadius: '10px'}`)
      span.text-bold Опубликовать
</template>

<script>
export default {
  name: 'nodeCreator__nodePreview',
  props: ['tab', 'fragments'],
  data () {
    return {
      publishing: false,
      layout: 'PIP',
      categories: ['FUN'],
      spheres: [],
      name: ''
    }
  },
  computed: {
    node () {
      let fragments = []
      for (const f in this.fragments) {
        fragments.push(this.fragments[f])
      }
      return {
        uid: this.uid,
        name: this.name,
        author: this.$store.state.auth.user,
        fragments: fragments.map(f => {
          // this.$log('f', f)
          return {
            uid: f.uid,
            oid: f.content.oid,
            content: f.content,
            name: f.name,
            thumbUrl: f.thumbUrl,
            relativeCuts: f.relativeCuts,
            relativeScale: f.relativeScale
          }
        }),
        spheres: this.spheres,
        categories: this.categories,
        createdAt: Date.now(),
        meta: {
          layout: this.layout,
          fragments: fragments.map(f => {
            return {uid: f.uid, thumbUrl: f.thumbUrl}
          })
        }
      }
    }
  },
  methods: {
    async publish () {
      try {
        this.$log('nodePublish start', this.node)
        this.publishing = true
        // await this.$wait(3000)
        // create mutation
        // TODO: take name and categories from node computed, from here?
        this.node.name = this.name
        this.node.categories = ['FUN']
        let node = await this.$store.dispatch('node/nodeCreate', this.node)
        // delete ws draft
        if (this.draft) {
          let deleteWSDraft = await this.$store.dispatch('workspace/deleteWSDraft', this.draft)
          this.$log('deleteWSDraft', deleteWSDraft)
        }
        // remove draftLocal
        localStorage.removeItem('draft')
        // remove draftStorage
        this.$store.commit('workspace/stateSet', ['draft', null])
        // done
        this.$log('nodePublish done', node)
        this.publishing = false
        // go to home
        this.$router.push(`/app/home`)
      } catch (error) {
        this.$log('nodePublis error', error)
        this.publishing = false
        this.$q.notify({message: 'Node publish error!', color: 'red', textColor: 'white'})
      }
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
