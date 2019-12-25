<style lang="stylus">
</style>
<template lang="pug">
div(
  :style=`{position: 'relative', height: 200+'px',
    borderRadius: '10px', oveflow: 'hidden',
    border: urlInputFocused ? '2px solid #52b156' : '2px solid #eee'}`
    ).row.full-width.items-center.justify-center.bg-white
  q-dialog(ref="ncFragmentContentWsDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    div(@click.self="$refs.ncFragmentContentWsDialog.hide()").row.fit.items-end.content-end.justify-center
      div(:style=`{maxHeight: $q.screen.height-60+'px', borderRadius: '10px 10px 0 0', overflow: 'hidden', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).column.fit.bg-grey-3
        .col.full-width
          ws-items(ctx="inEditor" :types="['fragments', 'contents']" @itemClick="wsItemClick")
  div(
    v-if="progressShow && $store.state.events.progress"
    :style=`{
      position: 'absolute', zIndex: 100000, left: 0,
      width: ($store.state.events.progress.progress)+'%',
      height: '100%', opacity: 0.8}`).row.items-center.justify-center.bg-accent
      span(:style=`{fontSize: '30px'}`).text-white {{ $t($store.state.events.progress.progress) }}
  div.row.full-width.q-px-lg
    input(ref="fileInput" type="file" @change="fileChanged" :style=`{display: 'none'}`)
    q-input(
      ref="urlInput"
      v-model="url" color="green" invert
      @paste="urlPasted" @focus="urlInputFocused = true" @blur="urlInputFocused = false"
      :loading="urlInputLoading"
      :placeholder="$t('Paste URL')"
      :style=`{}`
      :input-style=`{paddingLeft: '0px', paddingRight: '0px'}`).full-width
      template(v-slot:append)
        q-btn(v-if="!urlInputLoading && url.length === 0" round flat icon="add" @click="$refs.ncFragmentContentWsDialog.show()")
        q-btn(v-if="!urlInputLoading && url.length > 0" round flat icon="clear" @click="url = ''")
      template(v-slot:prepend)
        q-btn(v-if="!urlInputLoading && url.length === 0" round flat icon="attach_file" @click="$refs.fileInput.click()")
</template>

<script>
import wsItems from 'components/workspace/ws_items'
import {fragments} from 'schema/fragments'

export default {
  name: 'ncFragmentContent',
  components: {wsItems},
  props: ['width'],
  data () {
    return {
      url: '',
      urlInputLoading: false,
      urlInputFocused: false,
      file: null,
      progressShow: false
    }
  },
  watch: {
    url: {
      handler (to, from) {
        this.$log('url CHANGED WATCHER', to)
        this.urlChanged(to)
      }
    }
  },
  methods: {
    wsItemClick (val) {
      this.$log('wsItemClick', val)
      switch (val.type) {
        case 'content': {
          this.$emit('content', val.item)
          break
        }
        case 'cut': {
          this.$emit('fragment', val.item)
          break
        }
        case 'fragment': {
          this.$emit('fragment', val.item)
          break
        }
      }
    },
    async urlPasted (url) {
      this.$log('urlPasted', url)
      await this.$wait(200)
      this.$refs.urlInput.blur()
      // this.urlChanged(url)
    },
    async urlChanged (to) {
      this.$log('url CHANGED', to)
      try {
        let url = new URL(to)
        this.$log('url GOOD', url)
        this.urlInputLoading = true
        let content = await this.contentGet(to, true)
        await this.$wait(500)
        this.$log('content', content)
        this.$emit('content', content)
        this.urlInputLoading = false
      } catch (e) {
        this.$log('url WRONG', to)
      }
    },
    async contentGet (url, onlyMeta = true) {
      this.$log('contentGet start')
      if (!onlyMeta) this.progressShow = true
      let {data: {uploadContentUrl}} = await this.$apollo.mutate({
        mutation: gql`
          ${fragments.objectFragment}
          mutation nc_uploadContentUrl ($url: String!, $onlyMeta: Boolean!) {
            uploadContentUrl (url: $url, onlyMeta: $onlyMeta) {
              ...objectFragment
            }
          }
        `,
        variables: {
          url: url,
          onlyMeta: onlyMeta
        }
      })
      if (!onlyMeta) {
        this.progressShow = false
      }
      this.$store.commit('events/stateSet', ['progress', null])
      this.$log('contenGet done', uploadContentUrl)
      return uploadContentUrl
    },
    async fileChanged (e) {
      this.$log('fileChanged', e.target.files['0'])
    }
  },
  mounted () {
    this.$log('mounted')
    this.$nextTick(() => {
      this.$refs.urlInput.focus()
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
