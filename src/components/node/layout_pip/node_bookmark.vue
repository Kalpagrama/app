<template lang="pug">
q-btn(
  @click="bookmarkStart()"
  round flat color="white"
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
      bookmarked: false,
    }
  },
  methods: {
    async bookmarkStart () {
      try {
        this.$log('bookmarkStart')
        this.loading = true
        let input = await this.bookmarkCreate()
        await this.$wait(1000)
        let item = await this.bookmarkSave(input)
        this.bookmarkNotify(item.id)
        this.bookmarked = true
        this.loading = false
      }
      catch (e) {
        this.$log('bookmarkStart error', e)
        this.loading = false
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
        spheres: []
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
      this.$log('bookmarkVerify')
      let {items: nodeFind} = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          oid: this.node.oid
        }
      })
      this.$log('nodeFind', nodeFind)
      if (nodeFind.length > 0) this.bookmarked = true
    }
  },
  async mounted () {
    this.$log('mounted')
    this.bookmarkVerify()
  }
}
</script>
