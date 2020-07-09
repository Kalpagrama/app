<template lang="pug">
q-btn(
  @click="bookmarkStart()"
  round flat
  :color="deleting ? 'red' : 'white'"
  :icon="bookmarked ? 'bookmark' : 'bookmark_outline'"
  :loading="loading"
  :style=`{
    background: 'rgba(0,0,0,0.1)',
  }`
  )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeBookmark',
  props: ['node', 'nodeFull'],
  data () {
    return {
      loading: false,
      deleting: false,
      bookmarked: null,
      color: 'white',
    }
  },
  methods: {
    async bookmarkStart () {
      try {
        this.$log('bookmarkStart')
        this.$log('bookmarkStart bookmarked', this.bookmarked)
        this.loading = true
        await this.$wait(400)
        // delete from saved if we got it already
        if (this.bookmarked) {
          this.deleting = true
          await this.bookmarkDelete(this.bookmarked)
          await this.$wait(400)
          this.$q.notify({type: 'negative', message: this.$t('nodeBookmark_Deleted', 'Ядро удалено')})
          await this.bookmarkVerify()
        }
        // add to saved nodes
        else {
          let input = await this.bookmarkCreate()
          let item = await this.bookmarkSave(input)
          this.bookmarkNotify(item.id)
          await this.$wait(400)
          await this.bookmarkVerify()
        }
        // done
        this.loading = false
        this.deleting = false
      }
      catch (e) {
        this.$log('bookmarkStart error', e)
        this.loading = false
        this.deleting = false
      }
    },
    async bookmarkCreate () {
      this.$log('bookmarkCreate')
      let node = JSON.parse(JSON.stringify(this.nodeFull))
      this.$log('bookmarkCreate node', node)
      let compositions = []
      await Promise.all(
        node.items.map(async (item) => {
          let composition = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
          this.$log('composition', composition)
          if (composition) {
            let compositionInput = JSON.parse(JSON.stringify(composition))
            // prepare composition
            // add id to composition... or add it to workspace...
            // TODO: save compositions to WORKSPACE as is? or only in the node...
            // add id to every layer...
            compositionInput.thumbOid = compositionInput.thumbUrl
            compositionInput.contentOid = composition.layers[0].contentOid
            compositionInput.layers.map((l, li) => {
              l.id = `${Date.now().toString()}-${li}`
              return l
            })
            compositions.push(compositionInput)
          }
        })
      )
      let input = {
        oid: node.oid,
        wsItemType: 'WS_NODE',
        thumbOid: node.meta.items[0].thumbUrl,
        name: node.name,
        layout: node.layout,
        category: node.category,
        items: compositions,
        stage: 'saved',
        spheres: node.spheres.map(s => {
          return {name: s.name}
        })
      }
      this.$log('bookmarkCreate compositions', compositions)
      this.$log('bookmarkCreate input', input)
      return input
    },
    async bookmarkSave (input) {
      // create node in ws
      this.$log('bookmarkSave', input)
      let item = await this.$rxdb.set(RxCollectionEnum.WS_NODE, input)
      this.$log('bookmarkSave item', item)
      return item
    },
    async bookmarkDelete (id) {
      this.$log('bookmarkDelete start', id)
      await this.$rxdb.remove(id)
      this.$log('bookmarkDelete done')
    },
    bookmarkNotify (id) {
      this.$log('bookmarkNotify', id)
      if (!id) return
      // notify and maybe show...
      this.$q.notify({
        type: 'positive',
        message: this.$t('node_saved', 'Ядро сохранено!'),
        actions: [
          {
            label: this.$t('go', 'Перейти'),
            color: 'white',
            handler: () => {
              this.$log('nodeShow start')
              this.$router.push(`/workspace/node/${id}`)
            }
          },
          {
            label: this.$t('close', 'Закрыть'),
            color: 'white',
            handler: () => {
              this.$log('Close')
            }
          }
        ]
      })
    },
    async bookmarkVerify () {
      this.$log('bookmarkVerify start')
      let {items: nodeFind} = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          oid: this.node.oid,
          stage: 'saved',
        }
      })
      this.$log('bookmarkVerify nodeFind', nodeFind.length)
      if (nodeFind.length > 0) {
        this.$log('bookmarkVerify FOUND', nodeFind[0].id)
        this.bookmarked = nodeFind[0].id
      }
      else {
        this.bookmarked = null
      }
      this.$log('bookmarkVerify done', this.bookmarked)
    }
  },
  async mounted () {
    this.$log('mounted')
    this.bookmarkVerify()
  }
}
</script>
