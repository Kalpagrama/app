<template lang="pug">
q-btn(
  @click="start()"
  round flat color="grey-2" icon="select_all"
  :loading="loading"
  :style=`{
    position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
    top: '8px', left: '8px',
    background: 'rgba(0,0,0,0.15)',
  }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'compositionPlayer_video_explorer',
  props: ['composition', 'options'],
  data () {
    return {
      loading: false,
      contentKalpa: null,
    }
  },
  methods: {
    async start () {
      this.$log('start')
      this.loading = true
      // this.$router.push('/content/'+composition.layers[0].contentOid)
      // try to find this content in workspace ? go for it : create a dummy?
      let contentOid = this.composition.layers[0].contentOid
      this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, contentOid)
      this.$log('start contentKalpa', this.contentKalpa)
      let start = this.composition.layers[0].figuresAbsolute[0].t
      this.$log('start startat', start)
      let contentWorkspace = await this.contentAdd(this.contentKalpa)
      this.loading = false
      this.$router.push(`/workspace/content/${contentWorkspace.id}?viewid=nodes&startat=${start}&removeonempty=true`)
    },
    async contentAdd (content) {
      this.$log('contentAdd content', content)
      // todo неверное решение! мастерская автономна! oid появится только после синхронизации!!!!
      let {items: contentFind} = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
          contentOid: content.oid
        }
      })
      this.$log('contentAdd contentFind', contentFind)
      // create rxDoc
      if (contentFind.length === 0) {
        let contentInput = {
          wsItemType: 'WS_CONTENT',
          thumbOid: content.thumbUrl,
          name: content.name,
          layers: [],
          spheres: [],
          contentOid: content.oid,
          contentType: content.type,
          operation: {
            items: null,
            operations: null,
            type: 'CONCAT'
          }
        }
        this.$log('contentAdd contentInput', contentInput)
        let res = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, contentInput)
        this.$log('contentAdd res', res)
        return res
      } else {
        return contentFind[0]
      }
    },
  }
}
</script>
