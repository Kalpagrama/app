<template lang="pug">
div(:style=`{height: '55px'}`).row.full-width.items-center.justify-end.q-px-sm
  //- actions
  //- share
  k-menu-popup(ref="nodeShareMenu" name="Поделиться" :actions="actions" @action="nodeShare")
    q-btn(color="grey-9" round flat)
      q-icon(name="share" size="26px" color="grey-8")
  //- rate/answer
  k-menu-popup(ref="nodeRateAnswerMenu" :noName="true" :actions="nodeActions" @action="nodeAction")
  .col
  //- rate
  div(v-if="nodeFull && nodeFull.rateUser").q-mr-sm
    small {{Math.ceil(nodeFull.rateUser*100)}}/
    span(:style=`{fontSize: '15px'}`).text-bold {{Math.ceil(nodeFull.rate*100)}}
  //- blur
  q-btn(color="grey-9" round flat @click="nodeBlur()")
    q-icon(name="blur_on" size="34px")
</template>

<script>
export default {
  name: 'nodeActions',
  components: {},
  props: ['index', 'zIndex', 'node', 'nodeFull', 'active'],
  data () {
    return {
      actions: [
        {id: 'to_bookmark', name: 'Сохранить в закладки'},
        {id: 'to_telegram', name: 'Отправить в Telegram'},
        {id: 'to_copy', name: 'Скопировать ссылку'}
      ],
      nodeActions: [
        {id: 'rate', name: 'Переголосовать'},
        {id: 'answer', name: 'Ответить ядром'}
      ]
    }
  },
  methods: {
    nodeShare ({id}) {
      // this.$log('nodeShare', id)
      switch (id) {
        case 'to_bookmark': {
          this.$log('nodeShare', id)
          this.nodeBookmark()
          break
        }
        case 'to_telegram': {
          this.$log('nodeShare', id)
          break
        }
        case 'to_copy': {
          this.$log('nodeShare', id)
          break
        }
      }
    },
    nodeAction ({id}) {
      this.$log('nodeAction', id)
      switch (id) {
        case 'rate': {
          this.nodeRate()
          break
        }
        case 'answer': {
          this.nodeAnswer()
          break
        }
      }
    },
    nodeBlur () {
      this.$log('nodeBlur')
      if (this.nodeFull.rateUser) {
        this.$refs.nodeRateAnswerMenu.show()
      } else {
        this.nodeRate()
      }
    },
    async nodeAnswer () {
      this.$log('nodeAnswer')
      this.$store.commit('node/state', ['answer', true])
      this.nodeRate()
    },
    async nodeRate () {
      this.$log('nodeRate')
      this.$store.commit('node/state', ['node', this.node])
      this.$store.commit('node/state', ['nodeFull', this.nodeFull])
      // await this.$wait(300)
      this.$nextTick(() => {
        this.$store.commit('ui/state', ['dialogOpened', true])
      })
    },
    async nodeBookmark () {
      this.$log('nodeBookmark')
      this.$store.commit('workspace/state', ['bookmark', {url: this.node.oid}])
      // await this.$wait(300)
      this.$nextTick(() => {
        this.$store.commit('workspace/state', ['bookmarkEditorDialogOpened', true])
      })
    }
  }
}
</script>
